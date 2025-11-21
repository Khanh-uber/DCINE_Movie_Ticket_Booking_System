package com.example.cinema.repository;

import com.example.cinema.entity.*;

import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface SeatRepository extends JpaRepository<Seat, Long>{ 
    
    List<Map<String,Object>> findSeatByShowtime(@Param("showtimeId") Long showtimeId)
    
}
