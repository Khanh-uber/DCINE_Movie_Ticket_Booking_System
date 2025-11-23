package com.example.cinema.service;

import java.util.*;

import com.example.cinema.dto.LayoutDTO;
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
        LayoutDTO layout ;
        try {
            layout = objectMapper.readValue(layoutJson, LayoutDTO.class);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi parse layout_map");
        }

        Map<String, String> rowZoneMap = new HashMap<>();

        if (layout.getSeatTypes() != null){
            for (Map.Entry<String, String> e : layout.getSeatTypes().entrySet()) {
                String zoneName = e.getValue().toLowerCase();
                String[] rows = e.getKey().split(",");
                for (String r : rows) {
                    rowZoneMap.put(r.trim(), zoneName);
                }
            }
        }
        // lay multiplier

        List<Map<String, Object>> priceRow = seatTypeRepo.findPricingByHall(hallId);
        Map<String, Double> multiplierMap = new HashMap<>();

        for(Map<String, Object> row : priceRow){
            String zoneKey = ((String) row.get("name")).toLowerCase();
            double mul = ((Number) row.get("price_multiplier")).doubleValue();
            multiplierMap.put(zoneKey, mul);
        }
        List<PricingResponse.PricingItem> 

    }
}
