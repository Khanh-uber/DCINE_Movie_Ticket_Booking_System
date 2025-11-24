package com.example.cinema.controller;

import com.example.cinema.dto.*;
import com.example.cinema.service.ShowtimeDetailService;
import com.example.cinema.service.ShowtimeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/showtimes")

public class ShowtimeController {
    private final ShowtimeService showtimeService;
    private final ShowtimeDetailService showtimeDetailService;
    public ShowtimeController (ShowtimeService showtimeService, ShowtimeDetailService showtimeDetailService){
        this.showtimeService = showtimeService;
        this.showtimeDetailService = showtimeDetailService;
    }

    @GetMapping
    public ResponseEntity<List<ShowtimeDTO>> getShowtimes(@RequestParam(name = "movie", required = false ) Long movieId){
        List<ShowtimeDTO> showtimes = showtimeService.getAllShowtimesFlex(movieId);
        return ResponseEntity.ok(showtimes);
    }

    @GetMapping("/movie/{movieId}")
    public ResponseEntity<List<ShowtimeFlatDTO>> getShowtimesMovie(@PathVariable Long movieId){
        List<ShowtimeFlatDTO> showtimes = showtimeService.getShowtimesFlat(movieId);
        return ResponseEntity.ok(showtimes);
        
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getShowtimeDetail(@PathVariable Long id) {
        try {
            ShowtimeDetailResponse response = showtimeDetailService.getShowtimeDetail(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
    
}
