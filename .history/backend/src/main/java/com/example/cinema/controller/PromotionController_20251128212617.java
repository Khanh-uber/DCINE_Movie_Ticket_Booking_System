package com.example.cinema.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.cinema.dto.PromotionResponse;
import com.example.cinema.service.PromotionService;

@RestController
@RequestMapping("/api/promotions")
public class PromotionController {

    private final PromotionService voucherService;

    public PromotionController(PromotionService promotionService) {
        
    }

    @GetMapping
    public List<PromotionResponse> getActivePromotions() {
        return .getActivePromotions();
    }
}
