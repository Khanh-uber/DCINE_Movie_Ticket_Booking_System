package com.example.cinema.service;

import org.springframework.stereotype.Service;

import com.example.cinema.dto.TheaterDTO;
import com.example.cinema.repository.SeatRepository;
import com.example.cinema.repository.ShowTimeRepository;
import com.example.cinema.repository.TheaterRepository;
import java.util.*;
@Service
public class ValidateConflictService {

    private final SeatRepository seatRepo;
    private final ShowTimeRepository showtimeRepo;

    public ValidateConflictService(SeatRepository seatRepo, ShowTimeRepository showtimeRepo){
        this.seatRepo = seatRepo;
        this.showtimeRepo = showtimeRepo;
    }
    
    public List<String> validateSeatConflicts(Long showtimeId, List<String> seatCodes){
        // 1 Kiem tra showtime ton tai \
        S
    }
    

    
}
