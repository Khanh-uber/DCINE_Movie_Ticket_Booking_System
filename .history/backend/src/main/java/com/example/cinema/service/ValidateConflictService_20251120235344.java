package com.example.cinema.service;

import org.springframework.stereotype.Service;

import com.example.cinema.dto.*;
import com.example.cinema.repository.SeatRepository;
import com.example.cinema.repository.ShowTimeRepository;
import com.example.cinema.repository.TheaterRepository;
import java.util.*;
import com.example.cinema.entity.*;
@Service
public class ValidateConflictService {

    private final SeatRepository seatRepo;
    private final ShowTimeRepository showtimeRepo;

    public ValidateConflictService(SeatRepository seatRepo, ShowTimeRepository showtimeRepo){
        this.seatRepo = seatRepo;
        this.showtimeRepo = showtimeRepo;
    }
    
    public List<String> validateSeatConflicts(Long showtimeId, List<String> requestedSeats){
        // 1 Kiem tra showtime ton tai \
        Showtime st = showtimeRepo.findByShowtimeId(showtimeId);
        if (st == null){
            throw new RuntimeException("Suất chiếu không tồn tại");
        }

        Long hallId = showtimeRepo.findHallId(showtimeId);
        
        List<Seat> validSeats = seatRepo.find
    }
    

    
}
