package com.example.cinema.repository;

import com.example.cinema.entity.*;

import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface ConcessionVariantRepository extends JpaRepository<ConcessionVariant, Long>{ 
    @Query(value="""
            select * from concession_variant 
            where item_id = :itemId
            """, nativeQuery = true)
    List<ConcessionVariant> findByItemId(@Param("itemId") Long itemId);
    
}
