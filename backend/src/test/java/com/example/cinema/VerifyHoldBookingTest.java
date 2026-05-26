package com.example.cinema;

import com.example.cinema.dto.BookingRequest;
import com.example.cinema.dto.BookingResponse;
import com.example.cinema.entity.Seat;
import com.example.cinema.entity.Showtime;
import com.example.cinema.repository.BookingSeatRepository;
import com.example.cinema.repository.SeatLockRepository;
import com.example.cinema.repository.SeatRepository;
import com.example.cinema.repository.ShowTimeRepository;
import com.example.cinema.service.BookingService;
import com.example.cinema.service.HoldSeatService;
import com.example.cinema.service.RedisSeatService;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.support.EncodedResource;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import javax.sql.DataSource;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.Statement;
import java.util.List;
import java.util.Set;

@SpringBootTest
@Testcontainers(disabledWithoutDocker = true)
public class VerifyHoldBookingTest {

    @Container
    private static final MySQLContainer<?> MYSQL = new MySQLContainer<>("mysql:8.0.43")
            .withDatabaseName("dcine_schema")
            .withUsername("root")
            .withPassword("root");

    @Container
    private static final GenericContainer<?> REDIS = new GenericContainer<>("redis:7.2-alpine")
            .withExposedPorts(6379);

    static {
        MYSQL.start();
        REDIS.start();
    }

    @DynamicPropertySource
    static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", MYSQL::getJdbcUrl);
        registry.add("spring.datasource.username", MYSQL::getUsername);
        registry.add("spring.datasource.password", MYSQL::getPassword);
        registry.add("spring.datasource.driver-class-name", MYSQL::getDriverClassName);
        registry.add("spring.data.redis.host", REDIS::getHost);
        registry.add("spring.data.redis.port", () -> REDIS.getMappedPort(6379));
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "none");
        registry.add("spring.data.redis.repositories.enabled", () -> "false");
        registry.add("socket.emit.url", () -> "http://localhost:3001/emit-payment");
        registry.add("groq.api.key", () -> "test-key");
        registry.add("spring.mail.host", () -> "localhost");
        registry.add("spring.mail.port", () -> "2525");
        registry.add("spring.mail.username", () -> "test@example.com");
        registry.add("spring.mail.password", () -> "test-password");
    }

    @Autowired
    private HoldSeatService holdSeatService;

    @Autowired
    private RedisSeatService redisSeatService;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private ShowTimeRepository showTimeRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private BookingSeatRepository bookingSeatRepository;

    @Autowired
    private SeatLockRepository seatLockRepository;

    private static final Path FINAL_DB_SCRIPT = Path.of("database", "Finaldb.sql");

    @BeforeAll
    static void loadSchema() {
        DataSource dataSource = new DriverManagerDataSource(MYSQL.getJdbcUrl(), MYSQL.getUsername(), MYSQL.getPassword());

        try (Connection connection = dataSource.getConnection(); Statement statement = connection.createStatement()) {
            statement.execute("SET FOREIGN_KEY_CHECKS=0");
            statement.execute("SET UNIQUE_CHECKS=0");
            ScriptUtils.executeSqlScript(connection, new EncodedResource(new FileSystemResource(FINAL_DB_SCRIPT)));
            statement.execute("SET FOREIGN_KEY_CHECKS=1");
            statement.execute("SET UNIQUE_CHECKS=1");
        } catch (Exception ex) {
            throw new RuntimeException("Failed to load Finaldb.sql into test container", ex);
        }
    }

    @AfterEach
    void cleanup() {
        seatLockRepository.deleteAll();
    }

    @Test
    void hold_then_book_flow_keeps_db_locks_linked_to_pending_booking() {
        SeatSelection selection = findAvailableSeat();
        Assertions.assertThat(selection).as("expected an available seat in the seeded database").isNotNull();

        Long accountId = 1L;
        String sessionId = "integration-test-session";
        List<String> seatCodes = List.of(selection.code());

        holdSeatService.processHoldAction(selection.showtimeId(), accountId, seatCodes, "hold", sessionId);

        Assertions.assertThat(redisSeatService.getHeldSeatsForUser(selection.showtimeId(), accountId))
                .contains(selection.code());
        Assertions.assertThat(seatLockRepository.findByShowtimeIdAndSeatId(selection.showtimeId(), selection.seatId()))
                .isPresent();

        BookingRequest request = new BookingRequest();
        request.setShowtimeId(selection.showtimeId());
        BookingRequest.SeatRequest seatRequest = new BookingRequest.SeatRequest();
        seatRequest.setCode(selection.code());
        seatRequest.setType("adult");
        request.setSeats(List.of(seatRequest));

        var bookingResponse = bookingService.createBooking(selection.showtimeId(), accountId, request);

        Assertions.assertThat(bookingResponse.getItems())
            .extracting(BookingResponse.Item::getCode)
                .contains(selection.code());
        Assertions.assertThat(redisSeatService.getHeldSeatsForUser(selection.showtimeId(), accountId)).isEmpty();
        Assertions.assertThat(seatLockRepository.findByShowtimeIdAndSeatId(selection.showtimeId(), selection.seatId()))
                .isPresent()
                .get()
                .satisfies(lock -> {
                    Assertions.assertThat(lock.getBookingId()).isEqualTo(bookingResponse.getBookingId());
                    Assertions.assertThat(lock.getStatus()).isEqualTo("PENDING");
                });
    }

    private SeatSelection findAvailableSeat() {
        List<Showtime> showtimes = showTimeRepository.findAll();
        for (Showtime showtime : showtimes) {
            Long showtimeId = showtime.getShowtimeId();
            Long hallId = showTimeRepository.findHallId(showtimeId);
            if (hallId == null) {
                continue;
            }

            Set<String> bookedSeats = bookingSeatRepository.findBookedSeats(showtimeId);
            Set<String> heldSeats = redisSeatService.getAllHeldSeats(showtimeId);
            for (Seat seat : seatRepository.findSeatByHall(hallId)) {
                String code = seat.getRowLabel() + seat.getSeatNumber();
                if (!bookedSeats.contains(code) && !heldSeats.contains(code)) {
                    return new SeatSelection(showtimeId, seat.getSeatId(), code);
                }
            }
        }

        return null;
    }

    private record SeatSelection(Long showtimeId, Long seatId, String code) {}
}
