package com.example.cinema.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.cinema.dto.TheaterDTO;
import com.example.cinema.service.TheaterService;

@RestController
@RequestMapping("/api/theaters")

public class TheaterController {

    private final TheaterService service;
    public TheaterController(TheaterService theaterService){
        this.theaterService = theaterService;
    }
    @GetMapping
    public List<TheaterDTO> getAll() {
        return service.getAll();
    }
}
}
