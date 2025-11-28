package com.example.cinema.controller;

import com.example.cinema.service.TheaterService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/theaters")
public class TheaterController {

    private final TheaterService service;

    public TheaterController(TheaterService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getTheaters(
            @RequestParam(name = "province", required = false) Long provinceId
    ) {
        return ResponseEntity.ok(service.getTheaters(provinceId));
    }
}
