package com.example.cinema.repository;

import com.example.cinema.entity.*;

import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface ConcessionItemRepository extends JpaRepository<ConcessionItem, Long>{ 
    @Query(value="""
            select * from concession_item 
            where active = true
            """, nativeQuery = true)
    List<ConcessionItem> findByActive();

    @Query(value = """
            select * from concession_item
            where category = :category
            and active = true
            """, nativeQuery = true)
    List<ConcessionItem> findByCategoryAndActive(
        @Param("category") String category,
        @Param("active") boolean active
    );
    
}
