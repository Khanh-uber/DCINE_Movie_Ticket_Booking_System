package com.example.cinema.repository;

import com.example.cinema.dto.CastDTO;
import com.example.cinema.entity.Cast_person;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
// import org.springframework.transaction.annotation.*;
// import jakarta.transaction.Transactional;
// import org.springframework.data.jpa.repository.Modifying;
public interface PersonRepository extends JpaRepository<Cast_person, Long>{ 

    @Query(value = """
        SELECT 
            c.name AS name,
            c.role_type AS roleType,
            c.cast_url AS castUrl
        FROM cast_person c
        JOIN movie_cast mc ON mc.cast_id = c.cast_id
        WHERE mc.movie_id = :movieId AND c.role_type = 'ACTOR'
        """,
        nativeQuery = true)
    List<CastDTO> findCastByMovieId(@Param("movieId") Long movieId);

    @Query(value = """
        SELECT 
            c.name AS name,
            c.role_type AS roleType,
            c.cast_url AS castUrl
        FROM cast_person c
        JOIN movie_cast mc ON mc.cast_id = c.cast_id
        WHERE mc.movie_id = :movieId AND c.role_type = 'DIRECTOR'
        """,
        nativeQuery = true)
    List<CastDTO> findDirectorByMovieId(@Param("movieId") Long movieId);
}
