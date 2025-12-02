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
                        select distinct concat(s.row_label, s.seat_number) as code, bs.price_at_booking, st.name as zone , st.price_multiplier, s2.base_price from seat s
                        join booking_seat bs on bs.seat_id = s.seat_id
                        join seat_type st on st.seat_type_id = s.seat_type_id
                        join showtime s2 on s2.hall_id = s.hall_id 
                        where bs.booking_id = :bookingId
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
                        """;)
        List<String> findSeatsCode(@Param("bookingId") Long bookingId)
}
