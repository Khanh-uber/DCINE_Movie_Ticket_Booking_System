package com.example.cinema.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.cinema.dto.ConcessionMeruRespose;
import com.example.cinema.dto.ConcessionResponse;
import com.example.cinema.service.ConcessionService;



@RestController
@RequestMapping("/api/concessions")
public class ConcessionController {
    private final ConcessionService concessionService;
    public ConcessionController(ConcessionService concessionService){
        this.concessionService = concessionService;
    }
    @GetMapping
    public ResponseEntity<ConcessionMeruRespose> getMenu() {
        return ResponseEntity.ok(concessionService.getMenu());
    }

    @GetMapping("/summary")
    public ResponseEntity<ConcessionResponse> getSummary() {

        // Sau này bạn thay bằng accountId từ JWT
        Long accountId = 1L;

        ConcessionResponse response = concessionsSer.loadSummary(accountId);

        return ResponseEntity.ok(response);
    }

    
}