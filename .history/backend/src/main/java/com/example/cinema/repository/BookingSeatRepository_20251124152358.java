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
    Set<String> findBookedSeats(@Param("showtimeId") Long showtimeId);
    

}
