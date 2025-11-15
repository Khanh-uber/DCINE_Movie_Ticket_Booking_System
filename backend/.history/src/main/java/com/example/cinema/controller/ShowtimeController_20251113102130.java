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
    public ResponseEntity<List<ShowtimeDTO>> getShowtimes(){
        List<ShowtimeDTO> showtimes = showtimeService.getAllShowtimes();
        return ResponseEntity.ok(showtimes);
    }
    @GetMapping("/showtimes")
    public ResponseEntity<?> getShowtimes(@RequestParam(required = false) Long movieId) {
        return ResponseEntity.ok(ShowtimeService.getAllShowtimes(movieId));
    }
}
