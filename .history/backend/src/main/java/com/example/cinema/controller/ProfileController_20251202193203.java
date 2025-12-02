package com.example.cinema.controller;

import com.example.cinema.dto.ChangePasswordRequest;
import com.example.cinema.dto.ProfileResponse;
import com.example.cinema.dto.ProfileUpdateRequest;
import com.example.cinema.service.ProfileService;

import jakarta.servlet.http.HttpSession;

import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;
    
    public ProfileController(ProfileService profileService){
        this.profileService = profileService;
    }

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
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest req) {
        Long accountId = getAccountId();
        profileService.changePassword(req, accountId);
        return ResponseEntity.ok().body(
            java.util.Map.of("message", "Password updated")
        );
    }
    @GetMapping("/bookings")
    public ResponseEntity<?> getBookingHistory(HttpSession session) {
        Long accountId = getAccountId();
        List<Map<String, Object>> list = profileService.getBookingHistory(accountId);

        return ResponseEntity.ok(Map.of("bookings", list));
    }
}
