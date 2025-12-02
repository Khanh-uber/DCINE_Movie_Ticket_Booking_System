package com.example.cinema.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.cinema.dto.SeatMapResponse;
import com.example.cinema.service.SeatMapService;

@RestController
@RequestMapping("/api/showtimes")
public class SeatMapController {
    
    private final SeatMapService seatMapService;
    private Long getAccountId(){
        Long accountId = 1L;
        return accountId;
    }
    public SeatMapController (SeatMapService seatMapService){
        this.seatMapService = seatMapService;
    }
    
    @GetMapping("/{showtimeId}/seats")
    public ResponseEntity<?> getSeatMap(@PathVariable("showtimeId") Long showtimeId) {
        try {
            Long accountId = getAccountId();
            SeatMapResponse res = seatMapService.getSeatMap(showtimeId, accountId);
            return ResponseEntity.ok(res);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}

