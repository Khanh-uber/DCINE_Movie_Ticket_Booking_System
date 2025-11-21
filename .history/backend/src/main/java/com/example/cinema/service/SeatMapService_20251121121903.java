package com.example.cinema.service;

import org.springframework.stereotype.Service;
import com.example.cinema.dto.*;
import java.util.*;
import com.example.cinema.entity.*;
import com.example.cinema.repository.BookingSeatRepository;
import com.example.cinema.repository.SeatLayoutRepository;
import com.example.cinema.repository.SeatRepository;
import com.example.cinema.repository.ShowTimeRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
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

    public SeatMapResponse getSeatMap(Long showtimeId){
        
        // hall info 
        Map<String, Object> hall = showtimeRepo.findHallInfo(showtimeId);
        Long hallId = ((Number) hall.get("hall_id")).longValue();
        String hallName = (String) hall.get("name");
        

        // layout 
        String layoutJson = seatLayoutRepo.findLayoutMap(showtimeId);
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> layout = new HashMap<>();

        try {
            layout = mapper.readValue(layoutJson, Map.class);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        
        LayoutDTO layoutDTO = new LayoutDTO();
        layoutDTO.setRows((List<String>) layout.get("rows"));
        layoutDTO.setCols((Integer) layout.get("columns"));
        layoutDTO.setBlock((List<Integer>) layout.get("blocks"));
        layoutDTO.setSeatTypes((Map<String, String>) layout.get("seat_types"));
        layoutDTO.setAislesAfter((List<Integer>) layout.get("aislesAfter"));

        // seat-list
        List<Seat> seats = seatRepo.findSeatByHall(hallId);
        Map<String, String> seatTypes = (Map<String, String>) layout.get("seatTypes");
        List<SeatDTO> seatDTOs = new ArrayList<>();
        for (Seat s : seats){
            SeatDTO dto = new SeatDTO();
            String row = s.getRowLabel();
            int col = s.getSeatNumber();
            dto.setRow(row);
            dto.setCol(String.valueOf(col));
            // code = A1, A2, B7...
            dto.setCode(row + col);

            // zone phải lấy từ layout_map
            String zone = seatTypes.get(row)
            
    seatDTOs.add(dto);
        }
        List<String> booked = bookingSeatRepo.findBookedSeats(showtimeId);
        
        SeatMapResponse response = new SeatMapResponse();
        response.setShowtimeId(showtimeId);
        response.setHallId(hallId);
        response.setHallName(hallName);
        response.setLayout(layoutDTO);
        response.setBooked(booked);
        
        return response;

    }
}
