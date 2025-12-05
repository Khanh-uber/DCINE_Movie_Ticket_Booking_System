package com.example.cinema.repository;

import com.example.cinema.entity.*;

import jakarta.transaction.Transactional;

import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface BookingSeatRepository extends JpaRepository<BookingSeat, BookingSeatKey>{ 

        @Query(value = """
                SELECT CONCAT(s.row_label, s.seat_number)
                FROM booking b
                JOIN booking_seat bs ON bs.booking_id = b.booking_id
                JOIN seat s ON s.seat_id = bs.seat_id
                WHERE b.showtime_id = :showtimeId
                AND b.status = 'PAID'
        """, nativeQuery = true)
        Set<String> findBookedSeats(@Param("showtimeId") Long showtimeId);
    

        //(BookingService)
        @Query(value="""
                select CONCAT(s.row_label, s.seat_number)
                FROM booking b
                JOIN booking_seat bs ON bs.booking_id = b.booking_id
                JOIN seat s ON s.seat_id = bs.seat_id
                WHERE b.showtime_id = :showtimeId
                AND b.status = 'PAID'
                AND CONCAT(s.row_label, s.seat_number) IN (:codes)
        """, nativeQuery = true)
        Set<String> findBookedSeats(@Param("showtimeId") Long showtimeId, @Param("codes") List<String> codes);

        @Query(value = """
                SELECT CONCAT(s.row_label, s.seat_number)
                FROM booking b
                JOIN booking_seat bs ON bs.booking_id = b.booking_id
                JOIN seat s ON s.seat_id = bs.seat_id
                WHERE b.showtime_id = :showtimeId
                AND b.status = 'PENDING'
                AND CONCAT(s.row_label, s.seat_number) IN (:codes)
        """, nativeQuery = true)
        Set<String> findPendingSeats(
        @Param("showtimeId") Long showtimeId,
        @Param("codes") List<String> codes
        );

        @Modifying
        @Query(value = "DELETE FROM booking_seat WHERE booking_id = :bookingId", nativeQuery = true)
        void deleteSeatsByBookingId(@Param("bookingId") Long bookingId);


        // (ConcessionService)
        @Query(value="""
                        SELECT 
                                CONCAT(s.row_label, s.seat_number) AS code,
                                bs.price_at_booking,
                                st.name AS zone,
                                st.price_multiplier,
                                stt.base_price
                        FROM booking_seat bs
                        JOIN seat s ON s.seat_id = bs.seat_id
                        JOIN seat_type st ON st.seat_type_id = s.seat_type_id
                        JOIN booking b ON b.booking_id = bs.booking_id
                        JOIN showtime stt ON stt.showtime_id = b.showtime_id
                        WHERE bs.booking_id = :bookingId;
                        """, nativeQuery = true )
        List<Map<String, Object>> findSeatByBooking(@Param("bookingId") Long bookingId);

        @Query(value = """
                SELECT COALESCE(SUM(price_at_booking), 0)
                FROM booking_seat
                WHERE booking_id = :bookingId
                """, nativeQuery = true)
        Long sumSeatTotal(@Param("bookingId") Long bookingId);

        
        @Query(value = """
                        select concat(s.row_label, s.seat_number) as code
                        from seat s 
                        join booking_seat bs on bs.seat_id = s.seat_id
                        where booking_id = 11
                        """, nativeQuery = true)
        List<String> findSeatsCode(@Param("bookingId") Long bookingId);
}
