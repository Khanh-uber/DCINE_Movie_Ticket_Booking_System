package com.example.cinema.repository;

import com.example.cinema.entity.*;

import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface BookingSeatRepository extends JpaRepository<BoLayout, Long>{ 

    @Query(value="""
            select sl.layout_map
            from showtime s
            join hall h on s.hall_id = s.hall_id
            join seat_layout sl on sl.seat_layout_id = h.seat_layout_id
            where s.showtime_id = :showtimeId
            """, nativeQuery = true)
    String findLayoutMapByShowtime(@Param("showtimeId") Long showtimeId);
}
