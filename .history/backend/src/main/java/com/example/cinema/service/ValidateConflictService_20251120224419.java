package com.example.cinema.service;

import org.springframework.stereotype.Service;

import com.example.cinema.dto.TheaterDTO;
import com.example.cinema.repository.SeatRepository;
import com.example.cinema.repository.TheaterRepository;
import java.util.*;
@Service
public class ValidateConflictService {
    private final SeatRepository seatRepo;
    public TheaterService (TheaterRepository theaterRepo){
        this.theaterRepo = theaterRepo;
    }
    public List<TheaterDTO> getAll() {
        return theaterRepo.findAllWithLocation().stream()
                .map(TheaterDTO::fromEntity)
                .toList();
    }
}
