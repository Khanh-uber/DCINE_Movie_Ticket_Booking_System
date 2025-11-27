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

    @Query(value = "SELECT * FROM concession_variant WHERE item_id = :itemId AND value = :value", 
        nativeQuery = true)
    Map<String, Object> findByItemIdAndValue(@Param("itemId") Long itemId, @Param("value") String value );

    @Query(value = """
    SELECT v.label, v.value, v.price_diff 
    FROM concession_variant v
    JOIN concession_item i ON i.item_id = v.item_id
    WHERE v.item_id = :itemId
    AND (i.price + v.price_diff) = :unitPrice
""", nativeQuery = true)
    Map<String, Object> findByItemIdAndUnitPrice(@Param("itemId") Long itemId, @Param("unitPrice") Long unitPrice);
}