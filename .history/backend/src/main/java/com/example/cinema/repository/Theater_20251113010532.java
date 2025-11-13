package com.example.cinema.repository;

import com.example.cinema.entity.*;

import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
// import org.springframework.data.repository.query.Param;


public interface Theater extends JpaRepository<Theater, Long>{ 
        @Query(value="""
                        select t.theater_id as theaterId,
                                t.name as theaterName,
                        from theater t
                        join location l on l.
                        """;)
    List<Theater> findAllTheater();
}
