package com.example.cinema.controller;

import com.example.cinema.dto.ProfileResponse;
import com.example.cinema.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @GetMapping
    public ResponseEntity<?> getProfile() {
        try {
            ProfileResponse res = profileService.getProfile(accountId);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                java.util.Map.of("error", e.getMessage())   
            );
        }
    }
}
