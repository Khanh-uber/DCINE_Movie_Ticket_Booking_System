package com.example.cinema.controller;

import com.example.cinema.dto.MovieDTO;
import com.example.cinema.service.MovieService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/movies")
@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://127.0.0.1:5501"})
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

    // GET /api/movies?status=now
    @GetMapping
    public ResponseEntity<?> getMoviesByStatus(@RequestParam String status) {
        return ResponseEntity.ok(movieService.getMoviesByStatus(status));
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
    
    // // ====== 4️⃣ (TÙY CHỌN) LẤY TẤT CẢ PHIM ACTIVE ======
    // @GetMapping
    // public ResponseEntity<List<MovieDTO>> getAllMovies() {
    //     List<MovieDTO> movies = movieService.getAllActiveMovies();
    //     return ResponseEntity.ok(movies);
    // }
}
