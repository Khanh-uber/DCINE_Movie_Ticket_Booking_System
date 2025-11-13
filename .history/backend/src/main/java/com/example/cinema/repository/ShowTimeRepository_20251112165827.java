package com.example.cinema.repository;

import com.example.cinema.entity.*;

import java.time.*;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface ShowTimeRepository extends JpaRepository<Showtime, Long>{ 
    @Query(value="""
            select s.movie_id as movieId ,
                    t.theater_id as theaterId,
                    h.name as hallName,
                    Date(s.start_at) as date,
                    TIME_FORMAT(s.start_at, '%H:%i') AS time,
                    s.base_price as base_price 
            from showtime s 
            join hall h on h.hall_id = s.hall_id
            join theater t on t.theater_id = h.theater_id
            ORDER BY s.movie_id, t.theater_id, date, s.start_at;
            """, nativeQuery = true)
    List<Map<String, Object>> findAllShowtimes();
    
}
