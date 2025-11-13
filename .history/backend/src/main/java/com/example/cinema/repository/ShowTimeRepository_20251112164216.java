package com.example.cinema.repository;

import com.example.cinema.entity.*;

import java.time.*;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface ShowTimeRepository extends JpaRepository<Showtime, Long>{ 
    @Query(value="""
            select s.movie_id,
                t.theater_id,
                    h.name,
                    s.start_at
            from theater t
            join hall h on h.theater_id = t.theater_id
            join showtime s on s.hall_id = h.hall_id 
            """;)
}
