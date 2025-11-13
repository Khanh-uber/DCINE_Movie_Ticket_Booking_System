package com.example.cinema.repository;

import com.example.cinema.entity.*;

import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
// import org.springframework.data.repository.query.Param;



public interface TheaterRepository extends JpaRepository<Theater, Long>{ 
        @Query(value="""
                        select t.theater_id as id,
                                t.name as name ,
                                l.city_name as city
                        from theater t
                        join 
                        """;)
        List<Theater> findAllWithLocation();
}
