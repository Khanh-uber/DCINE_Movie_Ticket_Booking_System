package com.example.cinema.controller;

import com.example.cinema.service.LocationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/locations")
public class LocationController {

    private final LocationService service;

    public LocationController(LocationService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Map<String,Object>>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }
}
