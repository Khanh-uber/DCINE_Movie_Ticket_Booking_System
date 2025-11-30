package com.example.cinema.repository;

import com.example.cinema.entity.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;

public interface ShowTimeRepository extends JpaRepository<Showtime, Long> {

@Query(value = """
    SELECT
        s.showtime_id AS id,
        s.movie_id AS movieId,
        t.theater_id AS theaterId,
        s.start_at AS start_at,
        s.end_at AS end_at,
        s.base_price AS base_price,
        rt.name AS format
    FROM showtime s
    JOIN hall h ON h.hall_id = s.hall_id
    JOIN seat_layout sl ON sl.seat_layout_id = h.seat_layout_id
    JOIN room_type rt ON rt.room_type_id = sl.room_type_id
    JOIN theater t ON t.theater_id = h.theater_id
    WHERE (:movieId IS NULL OR s.movie_id = :movieId)
      AND (:provinceId IS NULL OR t.location_id IN (
            SELECT location_id FROM location WHERE province_id = :provinceId
      ))
    ORDER BY rt.name ASC, s.start_at ASC
""", nativeQuery = true)
List<Map<String,Object>> findShowtimesForFE(
        @Param("movieId") Long movieId,
        @Param("provinceId") Long provinceId
);

    @Query(value = """ 
        SELECT h.hall_id, h.name
        FROM hall h
        JOIN showtime st ON st.hall_id = h.hall_id 
        WHERE st.showtime_id = :showtimeId
        """, nativeQuery=true)
    Map<String, Object> findHallInfo(@Param("showtimeId") Long showtimeId);

    @Query(value = """
        SELECT *
        FROM showtime
        WHERE showtime_id = :showtimeId
        """, nativeQuery = true)
    Showtime findByShowtimeId(@Param("showtimeId") Long showtimeId);

    @Query(value = """
        SELECT hall_id
        FROM showtime 
        WHERE showtime_id = :showtimeId
        """, nativeQuery = true)
    Long findHallId(@Param("showtimeId") Long showtimeId);

    @Query(value = """
        SELECT 
            st.showtime_id      AS showtimeId,
            st.movie_id         AS movieId,
            m.title             AS movieTitle,
            m.poster_url        AS poster_url,
            m.trailer_url       AS trailer_url,
            YEAR(m.release_date) AS releaseYear,
            m.duration_min      AS durationMin,
            
            t.name              AS theaterName,
            DATE(st.start_at)   AS showDate,
            TIME(st.start_at)   AS startTime,
            rt.name             AS formatName,

            -- gom genre thành mảng JSON
            (
                SELECT JSON_ARRAYAGG(g.name)
                FROM movie_genre mg 
                JOIN genre g ON g.genre_id = mg.genre_id
                WHERE mg.movie_id = m.movie_id
            ) AS genres
        FROM showtime st
        JOIN movie m        ON m.movie_id = st.movie_id
        JOIN hall h         ON h.hall_id = st.hall_id
        JOIN theater t      ON t.theater_id = h.theater_id
        JOIN seat_layout sl ON sl.seat_layout_id = h.seat_layout_id
        JOIN room_type rt   ON rt.room_type_id = sl.room_type_id
        WHERE st.showtime_id = :id
    """, nativeQuery = true)
    
    Map<String,Object> findShowtimeDetailRaw(@Param("id") Long id);
    @Query(value="""
                select t.name as theater_name, 
                        Date(s.start_at) as show_date,
                        st.showtime_id as showtime_id,
                        TIME(st.start_at)   AS startTime,

                        
                        
                """, nativeQuery = true)
    @Query(value = "SELECT movie_id FROM showtime WHERE showtime_id = :id", nativeQuery = true)
    Long findMovieIdByShowtime(@Param("id") Long id);

    @Query(value = """
        SELECT s.base_price
        FROM showtime s
        WHERE s.showtime_id = :showtimeId
        """, nativeQuery= true)
    Double findBasePrice(@Param("showtimeId") Long showtimeId);

    @Query(value = """
        SELECT 
            m.title AS movieTitle,
            DATE(s.start_at) AS date,
            TIME(s.start_at) AS time
        FROM showtime s
        JOIN movie m ON m.movie_id = s.movie_id
        WHERE s.showtime_id = :showtimeId
        """, nativeQuery = true)
    Map<String, Object> getShowtimeMeta(@Param("showtimeId") Long showtimeId);
}
