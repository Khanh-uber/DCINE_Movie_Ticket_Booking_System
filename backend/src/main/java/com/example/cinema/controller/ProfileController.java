package com.example.cinema.controller;

import com.example.cinema.dto.ChangePasswordRequest;
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
    @GetMapping
    public ResponseEntity<?> getProfile(HttpSession session) {
        Long accountId = (Long) session.getAttribute("accountId");
        if (accountId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Vui lòng đăng nhập"));
        }
        return ResponseEntity.ok(profileService.getProfile(accountId));
    }
    @PutMapping
    public ResponseEntity<?> updateProfile(@RequestBody ProfileUpdateRequest request, HttpSession session) {
        Long accountId = (Long) session.getAttribute("accountId");
        if (accountId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Vui lòng đăng nhập"));
        }
        return ResponseEntity.ok(profileService.updateProfile(accountId, request));
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request, HttpSession session) {
        Long accountId = (Long) session.getAttribute("accountId");
        if (accountId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Vui lòng đăng nhập"));
        }
        
        try {
           //profileService.changePassword(accountId, request);
            return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    @GetMapping("/bookings")
    public Map<String, Object> getBookings(HttpSession session) {
        Long accId = (Long) session.getAttribute("accountId");
        if (accId == null) throw new RuntimeException("Unauthorized");

        List<Map<String, Object>> bookings = profileService.getBookingHistory(accId);

        return Map.of("bookings", bookings);
    }
}
