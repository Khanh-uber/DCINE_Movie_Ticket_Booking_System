package com.example.cinema.repository;

import com.example.cinema.entity.*;

import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface SeatTypeRepository extends JpaRepository<SeatType, Long>{ 
    

    @Query(value="""
            select distinct
                st.name, st.price_multiplier
            from seat_type st
            join seat s on s.seat_type_id = st.seat_type_id 
            join hall h on h.hall_id = s.hall_id
            where h.hall_id = :hallId
            """, nativeQuery = true)
    List<Map<String, Object>> findPricingByHall(@Param("hallId") Long hallId);
    
    @Query(value="""
            select *
            from seat_type 
            where name = :name
            """, nativeQuery = true)
    SeatType findByName(String name);

    
}
