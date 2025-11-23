package com.example.cinema.service;

import com.example.cinema.dto.PricingResponse;
import com.example.cinema.repository.SeatLayoutRepository;
import com.example.cinema.repository.SeatTypeRepository;
import com.example.cinema.repository.ShowTimeRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

public class PricingService {
    private final ShowTimeRepository showtimeRepo;
    private final SeatLayoutRepository seatLayoutRepository;
    private final SeatTypeRepository seatTypeRepo;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public PricingService(ShowTimeRepository showtimeRepo,
                                 SeatLayoutRepository seatLayoutRepo,
                                 SeatTypeRepository seatTypeRepo) {
        this.showtimeRepo = showtimeRepo;
        this.seatLayoutRepo = seatLayoutRepo;
        this.seatTypeRepo = seatTypeRepo;
    }
    
    public PricingResponse priview(Long showtimeId, )
}
