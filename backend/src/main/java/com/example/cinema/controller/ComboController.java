package com.example.cinema.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.cinema.dto.ComboResponse;
import com.example.cinema.service.ConcessionService;

@RestController
@RequestMapping("/api")
public class ComboController {
    private final ConcessionService concessionService;
    public ComboController(ConcessionService service){this.concessionService = service;}
    
    @GetMapping("/combos")
    public ResponseEntity<ComboResponse> getCombos() {
        return ResponseEntity.ok(concessionService.getAllCombos());
    }

}


