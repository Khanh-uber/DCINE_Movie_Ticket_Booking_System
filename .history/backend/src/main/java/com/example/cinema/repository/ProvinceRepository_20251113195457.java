package com.example.cinema.repository;

import com.example.cinema.entity.*;

import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;




public interface ProvinceRepository extends JpaRepository<Province, Long>{ 
        
    @Query(value ="""
            select province.id as id,
                province.province
            """;)
    List<Province> findAllProvince();
}
