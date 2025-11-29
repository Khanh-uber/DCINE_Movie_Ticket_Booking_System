package com.example.cinema.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.cinema.dto.PromotionResponse;

@RestController
@RequestMapping("/api/promotions")
public class VoucherController {

    private final VoucherService voucherService;

    public VoucherController(VoucherService voucherService) {
        this.voucherService = voucherService;
    }

    @GetMapping
    public List<PromotionResponse> getActivePromotions() {
        return voucherServ.getActivePromotions();
    }
}
