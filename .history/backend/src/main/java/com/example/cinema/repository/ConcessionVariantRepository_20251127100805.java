package com.example.cinema.repository;
import com.example.cinema.entity.ConcessionItem;
import com.example.cinema.entity.ConcessionVariant;

import io.lettuce.core.dynamic.annotation.Param;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
import org.springframework.data.jpa.repository.Query;

public interface ConcessionVariantRepository extends JpaRepository<ConcessionVariant, Long> {
    @Query(value="""
            
            select * from concession_variant cv
            join concession_item ci on ci.item_id q
            """;)
    List<ConcessionVariant> getConcessionVariantInfo();
}