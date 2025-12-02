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
      AND s.start_at > NOW()
    ORDER BY rt.name
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

    @Query(value="""
                select t.name as theater_name, 
                        Date(st.start_at) as show_date,
                        st.showtime_id as showtime_id,
                        TIME(st.start_at)  AS start_time,
                        st.start_at AS start_at, 
                        h.hall_id,
                        st.base_price,
                        rt.name as format_name,
                        st.movie_id  AS movieId,
                        m.title AS movieTitle,
                        YEAR(m.release_date) AS release_year,
                        m.duration_min      AS duration_min,
                        m.poster_url        AS poster_url,
                        m.trailer_url       AS trailer_url
                from showtime st
                join movie m        ON m.movie_id = st.movie_id
                JOIN hall h         ON h.hall_id = st.hall_id
                JOIN theater t      ON t.theater_id = h.theater_id
                JOIN seat_layout sl ON sl.seat_layout_id = h.seat_layout_id
                JOIN room_type rt   ON rt.room_type_id = sl.room_type_id
                where st.showtime_id = :id
                """, nativeQuery = true)
    Map<String, Object> findShowtimeDetailRaw(@Param("id") Long id);

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
            t.name AS theaterName,
            DATE(s.start_at) AS date,
            TIME(s.start_at) AS time,
            TIME(s.end_at) AS end_at
        FROM showtime s
        JOIN movie m ON m.movie_id = s.movie_id
        JOIN hall h ON h.hall_id = s.hall_id
        JOIN theater t ON t.theater_id = h.theater_id
        WHERE s.showtime_id = :showtimeId
        """, nativeQuery = true)
    Map<String, Object> getShowtimeMeta(@Param("showtimeId") Long showtimeId);
}
