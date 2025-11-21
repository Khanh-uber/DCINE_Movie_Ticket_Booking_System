package com.example.cinema.repository;

import com.example.cinema.entity.*;

import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface BookingSeatRepository extends JpaRepository<BookingSeat, Long>{ 

    @Query(value="""
            select concat(s.row_labelm s.seat_number)
            """, nativeQuery = true)
    String findLayoutMapByShowtime(@Param("showtimeId") Long showtimeId);
}
