package com.example.cinema.controller;

import com.example.cinema.dto.ProfileResponse;
import com.example.cinema.dto.ProfileUpdateRequest;
import com.example.cinema.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;


@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;
    
    public Profile

    private Long getAccountId() {
        return 1L; // sau thay bằng JWT/session
    }
    @GetMapping
    public ResponseEntity<?> getProfile() {
        try {
            Long accountId = getAccountId();
            ProfileResponse res = profileService.getProfile(accountId);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                java.util.Map.of("error", e.getMessage())   
            );
        }
    }
    @PutMapping
    public ResponseEntity<?> updateProfile(@RequestBody ProfileUpdateRequest req) {
        Long accountId = getAccountId();
        return ResponseEntity.ok(profileService.updateProfile(accountId, req));
    }

    @PutMapping("/password")
    
}
