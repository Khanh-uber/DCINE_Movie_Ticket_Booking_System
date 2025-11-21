package com.example.cinema.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.cinema.dto.ValidateRequest;
import com.example.cinema.service.ValidateConflictService;
import java.util.*;
@RestController
@RequestMapping("/api")
public class ValidateController {
    private final ValidateConflictService validateConflictService;
    private final ValidateRequest validateRequest;
    private final BookingS
    public ValidateController(ValidateConflictService validateConflictService, ValidateRequest validateRequest){
        this.validateConflictService = validateConflictService;
        this.validateRequest = validateRequest;
    }

    @PostMapping("/booking/validate-seats")
    public ResponseEntity<?> validate(@RequestBody ValidateSeatsRequest req) {
        try {
            List<String> conflict = bookingService.validateSeatConflicts(
                    req.getShowtimeId(), req.getSeats()
            );

            if (conflict.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Ghế hợp lệ",
                    "conflicts", List.of()
                ));
            } else {
                return ResponseEntity.status(409).body(Map.of(
                    "success", false,
                    "message", "Ghế không hợp lệ hoặc đã được đặt",
                    "conflicts", conflict
                ));
            }

        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

}