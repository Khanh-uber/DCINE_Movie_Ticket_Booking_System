package com.example.cinema.service;

import java.util.*;

import org.springframework.stereotype.Service;

import com.example.cinema.dto.LayoutDTO;
import com.example.cinema.dto.PricingRequest;
import com.example.cinema.dto.PricingResponse;
import com.example.cinema.repository.SeatLayoutRepository;
import com.example.cinema.repository.SeatTypeRepository;
import com.example.cinema.repository.ShowTimeRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;


@Service
public class PricingService {
    private final ShowTimeRepository showtimeRepo;
    private final SeatLayoutRepository seatLayoutRepo;
    private final SeatTypeRepository seatTypeRepo;
    

    public PricingService(ShowTimeRepository showtimeRepo,
                                 SeatLayoutRepository seatLayoutRepo,
                                 SeatTypeRepository seatTypeRepo) {
        this.showtimeRepo = showtimeRepo;
        this.seatLayoutRepo = seatLayoutRepo;
        this.seatTypeRepo = seatTypeRepo;
    }
    private String extractRowLabel(String code) {
    StringBuilder sb = new StringBuilder();
    for (char c : code.toCharArray()) {
        if (Character.isLetter(c)) sb.append(c);
        else break;
    }
    return sb.toString();
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
        LayoutDTO layout ;
        ObjectMapper mapper = new ObjectMapper();

        try {
            layout = mapper.readValue(layoutJson, .class);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
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
        List<PricingResponse.PricingItem> items = new ArrayList<>();
        int total = 0;
        for (PricingRequest.SeatSelect seatSel : req.getSeats()){
            String code = seatSel.getCode();
            String type = seatSel.getType();

            String rowLabel = extractRowLabel(code);

            String zone = rowZoneMap.getOrDefault(rowLabel, "standard");

            double multiplier = multiplierMap.getOrDefault(zone, 1.0);

            int adultPrice = (int) Math.round(basePrice * multiplier);
            int childPrice = "couple".equals(zone) ? adultPrice : (int)Math.round(adultPrice * 0.8);
            
            int finalPrice = type.equals("adult") ? adultPrice : childPrice;

            // Build item
            PricingResponse.PricingItem item = new PricingResponse.PricingItem();
            item.setCode(code);
            item.setZone(zone);
            item.setType(type);
            item.setPrice(finalPrice);

            items.add(item);
            total += finalPrice;
        }
        //  Final response
        PricingResponse res = new PricingResponse();
        res.setItems(items);
        res.setTotalAmount(total);

        return res;
    }
}
