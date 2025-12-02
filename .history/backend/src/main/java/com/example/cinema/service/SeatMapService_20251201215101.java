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
    private final RedisSeatService redisSeatService;
    public SeatMapService(RedisSeatService redisSeatService, BookingSeatRepository bookingSeatRepo,SeatRepository seatRepo,ShowTimeRepository showtimeRepo,SeatLayoutRepository seatLayoutRepo){
        this.bookingSeatRepo = bookingSeatRepo;
        this.seatRepo = seatRepo;
        this.showtimeRepo = showtimeRepo;
        this.seatLayoutRepo = seatLayoutRepo;
        this.redisSeatService = redisSeatService;
    }
    private Map<String, String> convertSeatTypes(Object obj) {
        Map<String, String> result = new HashMap<>();
        if (obj instanceof Map<?, ?> raw) {
            for (Map.Entry<?, ?> e : raw.entrySet()) {
                result.put(
                        String.valueOf(e.getKey()),
                        String.valueOf(e.getValue())
                );
            }
        }
        return result;
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

    
    return "standard";
}
    public SeatMapResponse getSeatMap(Long showtimeId, Long accountId){
        
        
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
        

        // seat-list
        List<Seat> seats = seatRepo.findSeatByHall(hallId);

        Set<String> booked = bookingSeatRepo.findBookedSeats(showtimeId);

        Set<String> heldByMe = redisSeatService.getHeldSeatsForUser(showtimeId, accountId);

        Set<String> heldByOthers = redisSeatService.getHeldSeatsExceptUser(showtimeId, accountId);
        
    
    
        
        List<SeatMapResponse.SeatItem> items = new ArrayList<>();
        
        for (Seat s : seats){
            SeatMapResponse.SeatItem item = new SeatMapResponse.SeatItem();
            
            String code = s.getRowLabel()+s.getSeatNumber();
            item.setCode(code);
            item.setCol(s.getSeatNumber());
            item.setRow(s.getRowLabel());
            String zone = resolveZoneFromLayout(s.getRowLabel(),(Map<String, String>) layout.get("seat_types"));
            
            item.setZone(zone);
            // status
            if (booked.contains(code)) {
                item.setStatus("booked");
            }
            else if (heldByMe.contains(code)) {
                item.setStatus("selected");  
            }
            else if (heldByOthers.contains(code)) {
                item.setStatus("held");
            }
            else {
                item.setStatus("available");
            }

            items.add(item);
        }



        SeatMapResponse response = new SeatMapResponse();
        response.setRows((List<String>) layout.get("rows"));
        response.setCols((Integer) layout.get("columns"));
        response.setSeats(items);

        return response;

    }
}
