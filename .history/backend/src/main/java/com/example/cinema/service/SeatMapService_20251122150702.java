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
    public String resolveZoneFromLayout(String row, Map<String, String> seatTypes) {

    // duyệt qua từng "key" của map
    for (Map.Entry<String, String> entry : seatTypes.entrySet()) {
        String groupedRows = entry.getKey();  
        String zoneName    = entry.getValue(); 

        String[] rows = groupedRows.split(",");

        for (String r : rows) {
            if (r.trim().equalsIgnoreCase(row)) {
                return zoneName.toLowerCase();  
            }
        }
    }

    // không match → default
    return "standard";
}
    public SeatMapResponse getSeatMap(Long showtimeId){
        
        // hall info 
        Map<String, Object> hall = showtimeRepo.findHallInfo(showtimeId);
        Long hallId = ((Number) hall.get("hall_id")).longValue();
        

        // layout 
        String layoutJson = seatLayoutRepo.findLayoutMap(showtimeId);
        if (layoutJson == null) {
            throw new RuntimeException("Không tìm thấy layout cho hall");
    }
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> layout = new HashMap<>();

        try {
            layout = mapper.readValue(layoutJson, Map.class);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        
        // LayoutDTO layoutDTO = new LayoutDTO();
        // layoutDTO.setRows((List<String>) layout.get("rows"));
        // layoutDTO.setCols((Integer) layout.get("columns"));
        // layoutDTO.setBlock((List<Integer>) layout.get("blocks"));
        // layoutDTO.setSeatTypes((Map<String, String>) layout.get("seat_types"));
        // layoutDTO.setAislesAfter((List<Integer>) layout.get("aislesAfter"));

        // seat-list
        List<Seat> seats = seatRepo.findSeatByHall(hallId);
        Map<String, String> seatTypes = (Map<String, String>) layout.get("seat_types");
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
            String zone = resolveZoneFromLayout(row,seatTypes);
            dto.setZone(zone);
            seatDTOs.add(dto);
        }
        
        SeatMapResponse response = new SeatMapResponse();
        response.setRows((List<String>) layout.get("rows"));
        response.setAislesAfter((List<Integer>) layout.get("aislesAfter"));

        return response;

    }
}
