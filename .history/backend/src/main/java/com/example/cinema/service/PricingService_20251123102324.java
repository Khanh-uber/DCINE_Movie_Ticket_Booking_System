package com.example.cinema.service;

import java.util.*;
import com.example.cinema.dto.PricingRequest;
import com.example.cinema.dto.PricingResponse;
import com.example.cinema.repository.SeatLayoutRepository;
import com.example.cinema.repository.SeatTypeRepository;
import com.example.cinema.repository.ShowTimeRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
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
        Double basePrice = showtimeRepo.findBasePrice(showtimeId);
        Long hallId = showtimeRepo.findHallId(showtimeId);
        if (basePrice == null || hallId == null) {
            throw new RuntimeException("Showtime không hợp lệ");
        }
        String layoutJson = seatLayoutRepo.findLayoutMap(hallId);
        if (layoutJson == null) {
            throw new RuntimeException("Không tìm thấy layout cho hall");
    }
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> layout = new HashMap<>();

        try {
            layout = mapper.readValue(layoutJson, Map.class);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi parse layout_map");
        }

        Map<String, String> rowZoneMap = new HashMap<>();

        if (layout.get("seat_types") != null) 

    }
}
