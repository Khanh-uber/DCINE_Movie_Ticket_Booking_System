package com.example.cinema.repository;

import com.example.cinema.entity.*;


import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
public interface HallRepository extends JpaRepository<Hall, Long>{ 
    @Query(value = """
    SELECT * FROM showtime
    WHERE movie_id = :movieId
    ORDER BY start_at
    """, nativeQuery = true)
    List<Showtime> findByMovieId(@Param("movieId") Long movieId);
}
