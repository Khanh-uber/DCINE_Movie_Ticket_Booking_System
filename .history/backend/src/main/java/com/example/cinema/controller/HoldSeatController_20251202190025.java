package com.example.cinema.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.cinema.dto.HoldSeatRequest;
import com.example.cinema.service.HoldSeatService;

@RestController
@RequestMapping("/api/showtimes")
public class HoldSeatController {
    
    private final HoldSeatService holdSeatService;

    private Long getAccountId()
    public HoldSeatController(HoldSeatService holdSeatService) {
        this.holdSeatService = holdSeatService;
    }

    @PostMapping("/{showtimeId}/holds")
    public ResponseEntity <?> holdOrRelease(@PathVariable("showtimeId") Long showtimeId, @RequestBody HoldSeatRequest req){
        try {
            Long accountId = 1L; // sau nay cap nhat lay account id tu session 
            holdSeatService.processHoldAction(
                    showtimeId,
                    accountId,
                    req.getSeats(),
                    req.getAction()
            );
            return ResponseEntity.ok("OK");
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}
