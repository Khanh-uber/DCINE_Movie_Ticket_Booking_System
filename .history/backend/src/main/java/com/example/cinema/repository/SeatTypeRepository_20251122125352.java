package com.example.cinema.repository;

import com.example.cinema.entity.*;

import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface SeatTypeRepository extends JpaRepository<SeatType, Long>{ 
    

    @Query(value="""
            select
                s.
            """;)
    List<Map<String, Object>>  findPricingByHall(@Param("hallId") Long hallId)
    

    
}
