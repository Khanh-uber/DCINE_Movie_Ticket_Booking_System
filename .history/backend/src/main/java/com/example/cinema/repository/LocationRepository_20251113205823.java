package com.example.cinema.repository;

import com.example.cinema.entity.*;

import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;




public interface LocationRepository extends JpaRepository<Location, Long>{ 
        
    @Query(value ="""
            select l.location_id,
                l.city_name as name 
                l.province_id 
            from location l
            """, nativeQuery = true)
    List<Location> findAllLocation();
}
