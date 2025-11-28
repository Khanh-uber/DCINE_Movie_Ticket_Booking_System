package com.example.cinema.controller;

import com.example.cinema.service.ProvinceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/provinces")
public class ProvinceController {

    private final ProvinceService provinceService;

    public ProvinceController(ProvinceService provinceService) {
        this.provinceService = provinceService;
    }

    @GetMapping
    public ResponseEntity<?> getAllProvinces() {
        return ResponseEntity.ok(provinceService.getAllProvinces());
    }

    @GetMapping("/{provinceId}/locations")
    public ResponseEntity<?> getLocationsByProvince(@PathVariable Long provinceId) {
        return ResponseEntity.ok(provinceService.getLocationsByProvinceId(provinceId));
    }
}
