package com.example.cinema.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.cinema.dto.ValidateRequest;
import com.example.cinema.service.BookingService;
import com.example.cinema.service.BookingService;
import java.util.*;
@RestController
@RequestMapping("/api")
public class BookingController {
    private final BookingService bookingService;
    private final ValidateRequest validateRequest;
    public BookingController(ValidateRequest validateRequest, BookingService bookingService){
        this.validateRequest = validateRequest;
        this.bookingService = bookingService;
    }

    @PostMapping("/booking/validate-seats")
    public ResponseEntity<?> validate(@RequestBody ValidateRequest req) {
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