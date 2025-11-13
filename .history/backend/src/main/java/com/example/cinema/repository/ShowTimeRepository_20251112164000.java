package com.example.cinema.repository;

import com.example.cinema.entity.*;

import java.time.*;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface ShowTimeRepository extends JpaRepository<Showtime, Long>{ 
    @Query(value="""
            
            """;)
}
