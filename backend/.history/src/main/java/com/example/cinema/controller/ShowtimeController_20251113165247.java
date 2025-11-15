package com.example.cinema.controller;

import com.example.cinema.dto.*;
import com.example.cinema.service.ShowtimeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/showtimes")

public class ShowtimeController {
    private final ShowtimeService showtimeService;
    public ShowtimeController (ShowtimeService showtimeService){
        this.showtimeService = showtimeService;
    }

    @GetMapping
    public ResponseEntity<List<ShowtimeDTO>> getShowtimes(@RequestParam(name = "movie", required = false ) Long movieId){
        List<ShowtimeDTO> showtimes = showtimeService.getAllShowtimesFlex(movieId);
        return ResponseEntity.ok(showtimes);
    }

    @GetMapping("/movies/{movieId}")
    pubic ResponseEntity<List<ShowtimeFlatDTO>> getShowtimesMovie(@PathVariable Long movieId){
        
    }
}
