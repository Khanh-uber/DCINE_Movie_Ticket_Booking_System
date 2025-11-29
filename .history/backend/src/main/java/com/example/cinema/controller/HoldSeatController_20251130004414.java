package com.example.cinema.controller;

import java.util.ArrayList;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.cinema.dto.HoldSeatRequest;
import com.example.cinema.service.HoldSeatService;
import
@RestController
@RequestMapping("/api/showtimes")
public class HoldSeatController {
    
    private final HoldSeatService holdSeatService;

    public HoldSeatController(HoldSeatService holdSeatService) {
        this.holdSeatService = holdSeatService;
    }

    @PostMapping("/{showtimeId}/holds")
    public ResponseEntity<?> holdOrRelease(
            @PathVariable Long showtimeId,
            @RequestBody HoldSeatRequest req
    ) {
        Long accountId = 1L; // tạm

        if (req.getSeats() == null || req.getSeats().isEmpty()) {
            return ResponseEntity.badRequest().body("Danh sách ghế trống");
        }

        List<String> codes = new ArrayList<>();
        for (HoldSeatRequest.SeatItem it : req.getSeats()) {
            if (it != null && it.getCode() != null) {
                codes.add(it.getCode());
            }
        }

        try {
            holdSeatService.processHoldAction(showtimeId, accountId, codes, req.getAction());
            return ResponseEntity.ok().body("OK");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
