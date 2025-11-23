package com.example.cinema.service;

import com.example.cinema.dto.PricingRequest;
import com.example.cinema.dto.PricingResponse;
import com.example.cinema.repository.SeatLayoutRepository;
import com.example.cinema.repository.SeatTypeRepository;
import com.example.cinema.repository.ShowTimeRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

public class PricingService {
    private final ShowTimeRepository showtimeRepo;
    private final SeatLayoutRepository seatLayoutRepo;
    private final SeatTypeRepository seatTypeRepo;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public PricingService(ShowTimeRepository showtimeRepo,
                                 SeatLayoutRepository seatLayoutRepo,
                                 SeatTypeRepository seatTypeRepo) {
        this.showtimeRepo = showtimeRepo;
        this.seatLayoutRepo = seatLayoutRepo;
        this.seatTypeRepo = seatTypeRepo;
    }
    
    public PricingResponse preview(Long showtimeId, PricingRequest req){
        if (req.getSeats() == null || req.getSeats().isEmpty()){
            throw new RuntimeException("Danh sach ghe trong");
        }
        Double base
    }
}
