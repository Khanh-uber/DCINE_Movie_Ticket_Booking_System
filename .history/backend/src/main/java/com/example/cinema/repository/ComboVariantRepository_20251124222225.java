package com.example.cinema.repository;

import com.example.cinema.entity.*;

import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface ComboVariantRepository extends JpaRepository<Combo, Long>{ 
    @Query(value="""
            select * from combo_variant 
            where combo_id 
            """, nativeQuery = true)
    List<ComboVariant> findByComboId();
    
}
