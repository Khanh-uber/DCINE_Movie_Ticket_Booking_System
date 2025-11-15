package com.example.cinema.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.*;
import com.example.cinema.entity.*;;
@RestController
@RequestMapping("/api/locations")
public class LocationController {
    private final 
    public ResponseEntity<?> getAllLocations(){
        List<Location> list = service.findAll();
        return ResponseEntity.ok(ResponseEntity.ok(list));
    }
}
