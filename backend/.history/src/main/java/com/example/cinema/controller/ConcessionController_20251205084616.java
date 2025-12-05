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

import jakarta.servlet.http.HttpSession;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ConcessionController {
    private final ConcessionService concessionService;
    public ConcessionController(ConcessionService concessionService){
        this.concessionService = concessionService;
    }
    @GetMapping("/concessions")
    public ResponseEntity<ConcessionMeruRespose> getMenu() {
        return ResponseEntity.ok(concessionService.getMenu());
    }

    @GetMapping("/checkout/summary")
    public ResponseEntity<?> getSummary(HttpSession session) { 
        Long accountId = (Long) session.getAttribute("accountId");
        if (accountId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Hết phiên đăng nhập"));
        }
        ConcessionResponse response = concessionService.loadSummary(accountId);
        return ResponseEntity.ok(response);
    }
    @PostMapping("/concessions/cart")
    public ResponseEntity<?> updateCart(@RequestBody ConcessionCartRequest req, HttpSession session) {
        Long accountId = (Long) session.getAttribute("accountId");
        if (accountId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Vui lòng đăng nhập"));
        }
        ConcessionResponse res = concessionService.updateCart(req, accountId);
        return ResponseEntity.ok(res);
    }
}