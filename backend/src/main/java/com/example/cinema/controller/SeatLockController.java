package com.example.cinema.controller;

import com.example.cinema.dto.LockSeatRequest;
import com.example.cinema.service.SeatLockService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/showtimes")
public class SeatLockController {

    private final SeatLockService seatLockService;

    public SeatLockController(SeatLockService seatLockService) {
        this.seatLockService = seatLockService;
    }

    @PostMapping("/{showtimeId}/locks")
    public ResponseEntity<?> lockSeats(@PathVariable Long showtimeId, @RequestBody LockSeatRequest req, HttpSession session) {
        try {
            Long accountId = resolveAccountId(session);
            if (accountId == null) return ResponseEntity.status(401).body(Map.of("error", "Phiên làm việc hết hạn"));

            String sessionId = session.getId();
            seatLockService.tryLockByCodes(showtimeId, req.getSeats(), accountId, sessionId, 300);
            return ResponseEntity.ok(Map.of("ok", true));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(409).body(Map.of("error", ex.getMessage()));
        }
    }

    private Long resolveAccountId(HttpSession session) {
        Object value = session.getAttribute("accountId");
        if (value instanceof Long longValue) {
            return longValue;
        }
        if (value instanceof Number number) {
            return number.longValue();
        }
        if (value instanceof String text) {
            try {
                return Long.valueOf(text.trim());
            } catch (NumberFormatException ignore) {
            }
        }
        return null;
    }

    @PostMapping("/{showtimeId}/locks/release")
    public ResponseEntity<?> releaseSeats(@PathVariable Long showtimeId, @RequestBody LockSeatRequest req) {
        try {
            seatLockService.releaseByCodes(showtimeId, req.getSeats());
            return ResponseEntity.ok(Map.of("ok", true));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }
}
