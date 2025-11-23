package com.example.cinema.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.cinema.dto.PricingRequest;
import com.example.cinema.service.PricingService;

@RestController
@RequestMapping("/api/showtimes")
public class PricingController {
    private final PricingService service;

    public PricingController(PricingService service) {
        this.service = service;
    }

    @PostMapping("/{id}/pricing-preview")
    public ResponseEntity<?> preview(
            @PathVariable Long id,
            @RequestBody PricingRequest req) {
        try {
            return ResponseEntity.ok(service.preview(id, req));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
