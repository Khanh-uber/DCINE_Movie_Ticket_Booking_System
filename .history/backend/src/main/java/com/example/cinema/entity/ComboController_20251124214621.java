package com.example.cinema.entity;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;

import com.example.cinema.dto.ComboResponse;
import com.example.cinema.service.ConcessionService;

public class ComboController {
    private final ConcessionService concessionService;
    public ComboController(ConcessionService service){this.concessionService = service;}
    
    @GetMapping("/combos")
    public ResponseEntity<ComboResponse> getCombos() {
        return ResponseEntity.ok(concessionService.getAllCombos());
    }

}


