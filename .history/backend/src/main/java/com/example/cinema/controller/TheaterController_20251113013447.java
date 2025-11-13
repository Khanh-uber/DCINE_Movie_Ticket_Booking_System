package com.example.cinema.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.cinema.dto.TheaterDTO;
import com.example.cinema.service.TheaterService;

public class TheaterController {
@RestController
@RequestMapping("/api/theaters")

public class TheaterController {

    private final TheaterService service;
    public TheaterController
    @GetMapping
    public List<TheaterDTO> getAll() {
        return service.getAll();
    }

    @GetMapping("/city/{city}")
    public List<TheaterDTO> getByCity(@PathVariable String city) {
        return service.getByCity(city);
    }

    @GetMapping("/{id}")
    public TheaterDTO getById(@PathVariable Long id) {
        return service.getById(id);
    }
}
}
