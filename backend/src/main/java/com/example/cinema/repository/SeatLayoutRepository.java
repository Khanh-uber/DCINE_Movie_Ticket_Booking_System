package com.example.cinema.repository;

import com.example.cinema.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface SeatLayoutRepository extends JpaRepository<SeatLayout, Long>{ 

    @Query(value="""
            select sl.layout_map
                from seat_layout sl
                join hall h on h.seat_layout_id = sl.seat_layout_id
                join showtime s on s.hall_id = h.hall_id
                where s.showtime_id = :showtimeId
            """, nativeQuery = true)
    String findLayoutMap(@Param("showtimeId") Long showtimeId);
}
