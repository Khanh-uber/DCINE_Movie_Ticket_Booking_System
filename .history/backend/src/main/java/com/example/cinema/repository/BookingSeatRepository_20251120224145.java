package com.example.cinema.repository;

import com.example.cinema.entity.*;

import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface BookingSeatRepository extends JpaRepository<BookingSeat, Long>{ 

    @Query(value = """
        SELECT CONCAT(s.row_label, s.seat_number)
        FROM booking b
        JOIN booking_seat bs ON bs.booking_id = b.booking_id
        JOIN seat s ON s.seat_id = bs.seat_id
        WHERE b.showtime_id = :showtimeId
        AND b.status = 'PAID'
    """, nativeQuery = true)
    List<String> findBookedSeats(@Param("showtimeId") Long showtimeId);
    
    @Query(value="""
                SELECT CONCAT(s.row_label, s.seat_number)
                FROM booking b
                JOIN booking_seat bs ON bs.booking_id = b.booking_id
                JOIN seat s ON s.seat_id = bs.seat_id
                WHERE b.showtime_id = :showtimeId
                AND b.status = 'PENDING';
            """, nativeQuery = true)
    List<String> findPendingSeats(@Param("showtimeId") Long showtimeId);


    @Query(value="""
            select * from booking_seat bs
            join booking b on b.booking_id = bs.booking_id
            where b.showtime_id = 3
            and b.status in('PAID', 'PENDING')
            and bs.seat_id = 1
            """, nativeQuery = true)
    List<BookingSeat> findConflict(@Param("showtimeId") Long showtimeId, @Param("seatIds") List<Long> seatIds);
}
