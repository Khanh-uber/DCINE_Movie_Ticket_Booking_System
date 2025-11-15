package com.example.cinema.repository;

import com.example.cinema.entity.*;

import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface ShowTimeRepository extends JpaRepository<Showtime, Long>{ 
//     @Query(value="""
//             select s.movie_id as movieId ,
// 	        t.theater_id as theaterId,
// 		h.name as hallName,
//                 Date(s.start_at) as date,
//                 TIME_FORMAT(s.start_at, '%H:%i') AS time,
//                 m.language as lang
//         from showtime s 
//         join hall h on h.hall_id = s.hall_id
//         join theater t on t.theater_id = h.theater_id
//         join movie m on s.movie_id = m.movie_id
//         ORDER BY s.movie_id, t.theater_id, date, s.start_at;
//             """, nativeQuery = true)
//     List<Map<String, Object>> findAllShowtimes();
    

    @Query(value = """
                        select      s.movie_id as movieId ,
                                t.theater_id as theaterId,
                                h.name as hallName,
                                Date(s.start_at) as date,
                                TIME_FORMAT(s.start_at, '%H:%i') AS time,
                                m.language as lang
                        from showtime s 
                        join hall h on h.hall_id = s.hall_id
                        join theater t on t.theater_id = h.theater_id
                        join movie m on s.movie_id = m.movie_id
                        WHERE (:movieId IS NULL OR s.movie_id = :movieId)
                        ORDER BY movieId, theaterId, date, time
                    """, nativeQuery = true )
    List<Map<String, Object>> findShowtimes(@Param("movieId") Long movieId);
    

    @Query(value="""
            select 
                s.showtime_id as id,
                s.movie_id as movieId,
                t.theater_id as theaterId,
                Date(s.start_at) as date,
                TIME_FORMAT(s.start_at, '%H:%i') AS time,
                m.language as language

            """, nativeQuery = true)
}
