package com.example.cinema.repository;
import com.example.cinema.entity.ConcessionItem;
import com.example.cinema.entity.ConcessionVariant;

import io.lettuce.core.dynamic.annotation.Param;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
import org.springframework.data.jpa.repository.Query;

public interface ConcessionVariantRepository extends JpaRepository<ConcessionVariant, Long> {
    @Query(value="""
            SELECT * FROM concession_variant  WHERE item_id = :itemId
            """, nativeQuery = true)
    List<ConcessionVariant> getConcessionVariantInfo(@Param("itemId") Long itemId);


    Map<String, Object> findByItemAndValue()
}