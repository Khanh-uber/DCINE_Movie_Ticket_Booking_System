package com.example.cinema.service;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.cinema.dto.SeatMapResponse;

@RestController
@RequestMapping("/api")
public class SeatMapController {
    
    private final SeatMapService seatMapService;
    public SeatMapController (SeatMapService seatMapService){
        this.seatMapService = seatMapService;
    }
    
    @GetMapping("/seatmap/{showtimeId")
    public ResponseEntity<SeatMapResponse
}
