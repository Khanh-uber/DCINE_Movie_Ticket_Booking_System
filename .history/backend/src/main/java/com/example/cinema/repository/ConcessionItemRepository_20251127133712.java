package com.example.cinema.repository;
import com.example.cinema.entity.ConcessionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
import org.springframework.data.jpa.repository.Query;

public interface ConcessionItemRepository extends JpaRepository<ConcessionItem, Long> {

    @Query(value="""
            select * from concession_item
            where active = true
            """, nativeQuery= true)
    List<ConcessionItem> getConcessionItemInfo();

    Map<String, Object> findItemInfo(@Param("itemId") Long itemId)
}