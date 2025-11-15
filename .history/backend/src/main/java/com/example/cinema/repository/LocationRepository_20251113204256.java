package com.example.cinema.repository;

import com.example.cinema.entity.*;

import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;




public interface LocationRepository extends JpaRepository<Location, Long>{ 
        
    @Query(value ="""
            select p.province_id,
                p.province_name
            from province p
            """, nativeQuery = true)
    List<Province> findAllProvince();
}
