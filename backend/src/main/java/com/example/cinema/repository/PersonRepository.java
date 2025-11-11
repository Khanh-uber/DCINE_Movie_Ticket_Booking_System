package com.example.cinema.repository;

import com.example.cinema.entity.Cast_person;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
// import org.springframework.transaction.annotation.*;
// import jakarta.transaction.Transactional;
// import org.springframework.data.jpa.repository.Modifying;
public interface PersonRepository extends JpaRepository<Cast_person, Long>{ 

    @Query(value ="""
            select distinct c.name
            from cast_person c
            join movie_cast mc on mc.cast_id = c.cast_id 
            WHERE mc.movie_id = :movieId AND c.role_type = 'ACTOR'
            """, nativeQuery = true)
    List<String> findCastByMovieId(@Param("movieId") Long movieId);

    @Query(value ="""
            Select distinct c.name
            from cast_person c
            join movie_cast mc on mc.cast_id = c.cast_id and c.role_type = 'DIRECTOR'
            where mc.movie_id = :movieId
            """, nativeQuery = true)
    List<String> findDirectorByMovieId(@Param("movieId") Long movieId);
}