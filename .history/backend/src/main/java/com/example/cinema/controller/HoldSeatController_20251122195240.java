package com.example.cinema.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.cinema.dto.HoldSeatRequest;
import com.example.cinema.service.HoldSeatService;

@RestController
@RequestMapping("/api/showtimes")
public class HoldSeatController {
    
    private final HoldSeatService holdSeatService;

    public HoldSeatController(HoldSeatService holdSeatService) {
        this.holdSeatService = holdSeatService;
    }

    @PostMapping("/{id}/holds")
    public ResponseEntity <?> holdOrRelease(@PathVariable("showtimeId") Long showtimeId, @RequestBody HoldSeatRequest)
}
