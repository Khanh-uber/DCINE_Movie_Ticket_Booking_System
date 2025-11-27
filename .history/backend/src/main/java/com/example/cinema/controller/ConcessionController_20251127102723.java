package com.example.cinema.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PathVariable; 
import org.springframework.web.bind.annotation.RestController;

import com.example.cinema.dto.ConcessionListResponse;
import com.example.cinema.dto.ConcessionMeruRespose;
import com.example.cinema.service.ConcessionService;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api")
public class ConcessionController {
    private final ConcessionService concessionService;
    public ConcessionController(ConcessionService concessionService){
        this.concessionService = concessionService;
    }
    @GetMapping("/concessions")
    public ResponseEntity<Concession> getMenu() {
        return ResponseEntity.ok(concessionsService.getMenu());
    }

    
}