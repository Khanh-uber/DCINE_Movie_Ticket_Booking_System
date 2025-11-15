package com.example.cinema.repository;

import com.example.cinema.entity.*;

import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;




public interface TheaterRepository extends JpaRepository<Theater, Long>{ 
        @Query(value="""
                        SELECT t.theater_id, t.name, t.address, t.location_id
                        FROM theater t
                        JOIN location l ON l.location_id = t.location_id
                        """, nativeQuery = true)
        List<Theater> findAllWithLocation();
}
