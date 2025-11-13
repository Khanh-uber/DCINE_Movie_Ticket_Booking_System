package com.example.cinema.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import com.example.cinema.;
import com.example.cinema.service.ShowtimeService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/showtimes")

public class ShowtimeController {
    private final ShowtimeService showtimeService;
    public ShowtimeController (ShowtimeService showtimeService){
        this.showtimeService = showtimeService;
    }

    @GetMapping
    public ResponseEntity<List<ShowtimeDTO>> getShowtimes()
}
