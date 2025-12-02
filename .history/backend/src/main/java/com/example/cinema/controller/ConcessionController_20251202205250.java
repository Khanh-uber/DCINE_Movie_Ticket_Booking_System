package com.example.cinema.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.cinema.dto.ConcessionCartRequest;
import com.example.cinema.dto.ConcessionMeruRespose;
import com.example.cinema.dto.ConcessionResponse;
import com.example.cinema.service.ConcessionService;



@RestController
@RequestMapping("/api/concessions")
public class ConcessionController {
    private final ConcessionService concessionService;
    private Long getAccountId(){
        Long accountId = 1L;
        return accountId;
    }
    public ConcessionController(ConcessionService concessionService){
        this.concessionService = concessionService;
    }
    @GetMapping
    public ResponseEntity<ConcessionMeruRespose> getMenu() {
        return ResponseEntity.ok(concessionService.getMenu());
    }

    @GetMapping("/summary")
    public ResponseEntity<ConcessionResponse> getSummary() {
        Long accountId = getAccountId();
        ConcessionResponse response = concessionService.loadSummary(accountId);

        return ResponseEntity.ok(response);
    }
    @PostMapping("/cart")
    public ResponseEntity<ConcessionResponse> updateCart(
            @RequestBody ConcessionCartRequest req
    ) {
        ConcessionResponse res = concessionService.updateCart(req, accountId);
        return ResponseEntity.ok(res);
    }

    
}