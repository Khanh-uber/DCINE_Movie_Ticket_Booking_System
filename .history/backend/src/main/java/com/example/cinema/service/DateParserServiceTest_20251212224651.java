// src/test/java/com/example/DateParserServiceTest.java

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

public class DateParserServiceTest {

    DateParserTest.DateParserService parser =
            new DateParserTest.DateParserService();

    @Test
    void testNgayKia() {
        LocalDate today = LocalDate.now();
        LocalDate result = parser.parse("ngày kia");

        assertEquals(today.plusDays(2), result);
    }

    @Test
    void testMot() {
        LocalDate today = LocalDate.now();
        LocalDate result = parser.parse("mốt đi xem phim");

        assertEquals(today.plusDays(2), result);
    }

    @Test
    void testMai() {
        LocalDate today = LocalDate.now();
        LocalDate result = parser.parse("mai");

        assertEquals(today.plusDays(1), result);
    }

    @Test
    void testHomNay() {
        LocalDate today = LocalDate.now();
        LocalDate result = parser.parse("hôm nay");

        assertEquals(today, result);
    }
}
