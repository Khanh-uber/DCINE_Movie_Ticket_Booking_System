package com.example.cinema.controller;

import com.example.cinema.dto.MovieDTO;
import com.example.cinema.service.MovieService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/movies")
public class MovieController {

    private final MovieService movieService;
    public MovieController(MovieService movieService ){
        this.movieService = movieService;
    }

    // ====== PHIM ĐANG CHIẾU ======
    @GetMapping("/now")
    public ResponseEntity<List<MovieDTO>> getNowShowingMovies() {
        List<MovieDTO> movies = movieService.getNowShowingMovies();
        return ResponseEntity.ok(movies);
    }

    // ====== PHIM SẮP CHIẾU ======
    @GetMapping("/soon")
    public ResponseEntity<List<MovieDTO>> getComingSoon() {
        List<MovieDTO> movies = movieService.getComingSoonMovies();
        return ResponseEntity.ok(movies);
    }

    // ====== LẤY THÔNG TIN 1 PHIM THEO ID ======
    @GetMapping("/{id}")
    public ResponseEntity<MovieDTO> getMovieById(@PathVariable Long id) {
        MovieDTO movie = movieService.getMovieById(id);
        if (movie == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(movie);
    }

    @GetMapping
    public ResponseEntity<List<MovieDTO>> getAllMovies(){
        List<MovieDTO> movies = movieService.getAllMovies();
        return ResponseEntity.ok(movies);
    }
}
