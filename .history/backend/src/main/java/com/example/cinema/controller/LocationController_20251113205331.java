package com.example.cinema.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.*;
import com.example.cinema.entity.*;
import com.example.cinema.service.LocationService;

@RestController
@RequestMapping("/api/locations")
public class LocationController {
    private final LocationService service;

    public LocationController(LocationService service) {
        this.service = service;
    }
    public ResponseEntity<?> getAllLocations(){
        List<Location> list = service.findAll();
        return ResponseEntity.ok(list);
    }
}
