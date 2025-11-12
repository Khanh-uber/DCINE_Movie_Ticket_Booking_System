package com.example.cinema.repository;

import com.example.cinema.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
// import org.springframework.transaction.annotation.*;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.Modifying;
public interface MovieRepository extends JpaRepository<Movie, Long>{ 
    // Lay phim dang chieu
    @Query(value="""
            select *
            from movie 
            where active = true
                and status = 'now'
            order by release_date desc
            
            """, nativeQuery = true)
    List<Movie> findNowShowingMovies();

    // Lay phim sap chieu 
    @Query(value="""
            select * 
            from movie 
            where active = true 
                and status = 'soon'
            order by release_date desc
            """, nativeQuery = true)
    List <Movie> findComingSoonMovies();

    // === UPDATE COMING SOOON ===
    @Modifying
    @Transactional
    @Query(value = """
            update movie m 
            set m.status = 'soon'
            where m.active = true
            and ( m.release_date > curdate()
                or not exists ( 
                    select 1 from showtime s
                    where s.movie_id = m.movie_id )
                    );
            """, nativeQuery = true)
    void updateComingSoon();

    @Query(value="""
            update movie m
            set status = 'now'
            where m.active = true and (
                m.release_date <= curdate() and exists (
                select 1 from showtime s 
                where s.movie_id = m.movie_id 
                    and s.end_at >= NOW()
                ));
            """, nativeQuery = true)
    void updateNowShowing();


    // Tim genre theo movie id
    @Query(value = """
            SELECT DISTINCT g.name
            FROM genre g
            JOIN movie_genre mg ON mg.genre_id = g.genre_id
            WHERE mg.movie_id = :movieId
            ORDER BY g.name
            """, nativeQuery = true)
    List<String> findGenresByMovieId(@Param("movieId") Long movieId);

    Movie findMovieById()
}
