package com.example.cinema.service;

import org.springframework.stereotype.Service;
import com.example.cinema.dto.*;
import java.util.*;
import com.example.cinema.dto.SeatMapResponseDTO.SeatMapResponse;
import com.example.cinema.entity.BookingSeat;
import com.example.cinema.repository.BookingSeatRepository;
import com.example.cinema.repository.SeatLayoutRepository;
import com.example.cinema.repository.SeatRepository;
import com.example.cinema.repository.ShowTimeRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class SeatMapService {
    private final SeatLayoutRepository seatLayoutRepo;
    private final ShowTimeRepository showtimeRepo;
    private final SeatRepository seatRepo;
    private final BookingSeatRepository bookingSeatRepo;

    public SeatMapService(BookingSeatRepository bookingSeatRepo,SeatRepository seatRepo,ShowTimeRepository showtimeRepo,SeatLayoutRepository seatLayoutRepo){
        this.bookingSeatRepo = bookingSeatRepo;
        this.seatRepo = seatRepo;
        this.showtimeRepo = showtimeRepo;
        this.seatLayoutRepo = seatLayoutRepo;
    }
    private LayoutDTO parseLayout(String layoutJson, Integer capacity) {
    try {
        ObjectMapper mapper = new ObjectMapper();

        JsonNode node = mapper.readTree(layoutJson);

        List<String> rows = node.has("rows")
                ? mapper.convertValue(node.get("rows"), new TypeReference<List<String>>() {})
                : List.of();

        List<Integer> cols = node.has("cols")
                ? mapper.convertValue(node.get("cols"), new TypeReference<List<Integer>>() {})
                : List.of();

        List<Integer> aisles = node.has("aislesAfter")
                ? mapper.convertValue(node.get("aislesAfter"), new TypeReference<List<Integer>>() {})
                : List.of();

        return new LayoutDTO(rows, cols, aisles, capacity);

    } catch (Exception e) {
        throw new RuntimeException("Invalid layout_map JSON in DB", e);
    }
}

    public SeatMapResponseDTO getSeatMap(Long showtimeId){
        // Layout map json 
        String layoutJson  = seatLayoutRepo.findLayoutMapByShowtime(showtimeId);
        LayoutDTO layout = parseLayout(layoutJson);
        
        // hall info 
        Map<String, Object> hall = showtimeRepo.findHallInfo(showtimeId);
        Long hallId = ((Number) hall.get("hall_id")).longValue();
        String hallName = (String) hall.get("name");
        

        List<SeatDTO> seatList = seatRepo.findSeatsByShowtime(showtimeId)
            .stream().map(row -> new SeatDTO(
                ((Number) row.get("seatId")).longValue(),
                (String) row.get("code"),
                (String) row.get("rowLabel"),
                ((String) row.get("seatNumber")),
                (String) row.get("typeName"),
                (String) row.get("typeName") // hoặc map zone
            )).toList();
        

        List<String> booked = bookingSeatRepo.findBookedCodes(showtimeId);
        
        // 5) pending - TODO (Redis)
        List<String> pending = List.of();

        return new SeatMapResponseDTO(
            showtimeId, hallId, hallName,
            layout, seatList, booked, pending
        );
        
    }
}
