package com.example.cinema.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.cinema.repository.ProvinceRepository;
import com.example.cinema.service.ProvinceService;

@RestController
@RequestMapping("/api")

public class ProvinceController {
    private final ProviceService provinceService;
    public ProviceService(ProviceService provineService){
        this.proviceService = 
    }
}
