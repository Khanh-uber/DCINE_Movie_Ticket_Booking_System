package com.example.cinema.service;

import org.springframework.stereotype.Service;
import com.example.cinema.dto.*;
import java.util.*;
import com.example.cinema.dto.SeatMapResponse;
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

    public SeatMapResponse getSeatMap(Long showtimeId){
        
        // hall info 
        Map<String, Object> hall = showtimeRepo.findHallInfo(showtimeId);
        Long hallId = ((Number) hall.get("hall_id")).longValue();
        String hallName = (String) hall.get("name");
        

        // layout 
        Map<String, Object> layout = seatLayoutRepo.findLayoutMap(showtimeId);
        LayoutDTO layoutDTO = new LayoutDTO();
        layoutDTO.setRows(layout.get("rows"));
        layoutDTO
        
        
        List<String> booked = bookingSeatRepo.findBookedSeats(showtimeId);
        
        SeatMapResponse response = new SeatMapResponse();

        response.setShowtimeId(showtimeId);
        response.setHallId(hallId);
        response.setHallName(hallName);
        response.setLayout(layout);

    }
}
