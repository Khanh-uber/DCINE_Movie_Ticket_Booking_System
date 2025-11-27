package com.example.cinema.repository;
import com.example.cinema.entity.ConcessionItem;

import io.lettuce.core.dynamic.annotation.Param;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
import org.springframework.data.jpa.repository.Query;

public interface ConcessionItemRepository extends JpaRepository<ConcessionItem, Long> {

    @Query(value="""
            select * from concession_item
            where active = true
            """, nativeQuery= true)
    List<ConcessionItem> getConcessionItemInfo();

    @Query(value="""
            select *
            from concession_item
            where item_id = :itemId
            """, nativeQuery = true)
    Map<String, Object> findItemInfo(@Param("itemId") Long itemId);
}