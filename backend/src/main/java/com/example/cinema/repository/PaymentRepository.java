package com.example.cinema.repository;

import com.example.cinema.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByTransactionId(String transactionId);

    // FIX 1 & 2: Ghép tên ghế và dùng đúng cột giá (price_at_booking)
    @Query(value = """
        SELECT 
            CONCAT(s.row_label, s.seat_number) as seat_code, 
            bs.price_at_booking as price
        FROM booking_seat bs
        JOIN seat s ON bs.seat_id = s.seat_id
        WHERE bs.booking_id = :bookingId
    """, nativeQuery = true)
    List<Map<String, Object>> findSeatsByBooking(@Param("bookingId") Long bookingId);

    @Query(value = "SELECT EXISTS(SELECT 1 FROM payment WHERE booking_id = :bookingId)", nativeQuery = true)
    Long existsByBooking(@Param("bookingId") Long bookingId);

    // Lấy thông tin Phim
    @Query(value = """
        SELECT 
            m.title as movieTitle, 
            t.name as theaterName, 
            sh.start_at as startTime 
        FROM booking b
        JOIN showtime sh ON b.showtime_id = sh.showtime_id
        JOIN movie m ON sh.movie_id = m.movie_id
        JOIN hall h ON sh.hall_id = h.hall_id
        JOIN theater t ON h.theater_id = t.theater_id
        WHERE b.booking_id = :bookingId
    """, nativeQuery = true)
    List<Map<String, Object>> findShowtimeInfoByBooking(@Param("bookingId") Long bookingId);

    // FIX 3: Đổi ci.name thành ci.title (cho đúng Database)
    @Query(value = """
        SELECT 
            ci.title as name, 
            bc.quantity as qty, 
            bc.total_price as price
        FROM booking_concession bc
        JOIN concession_item ci ON bc.item_id = ci.item_id
        WHERE bc.booking_id = :bookingId
    """, nativeQuery = true)
    List<Map<String, Object>> findCombosByBooking(@Param("bookingId") Long bookingId);
}