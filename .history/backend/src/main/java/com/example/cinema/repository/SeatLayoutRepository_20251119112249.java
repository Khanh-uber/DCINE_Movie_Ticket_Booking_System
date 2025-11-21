package com.example.cinema.repository;

import com.example.cinema.entity.*;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface SeatLayoutRepository extends JpaRepository<SeatLayout, Long>{ 

    @Query(value="""
            select sl.layout_map
                from seat_layout sl
                join 
                join hall h on h.seat_layout_id = sl.seat_layout_id
                where h.hall_id = :hallid
            """, nativeQuery = true)
    String findLayoutMapByHall(@Param("showtimeId") Long hallId);
}
