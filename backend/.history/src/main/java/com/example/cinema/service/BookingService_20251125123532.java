package com.example.cinema.service;

import org.springframework.stereotype.Service;

import com.example.cinema.dto.BookingRequest;
import com.example.cinema.dto.BookingResponse;
import com.example.cinema.entity.Seat;
import com.example.cinema.entity.SeatLayout;
import com.example.cinema.entity.Showtime;
import com.example.cinema.repository.BookingSeatRepository;
import com.example.cinema.repository.SeatLayoutRepository;
import com.example.cinema.repository.SeatRepository;
import com.example.cinema.repository.ShowTimeRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.*;
@Service
public class BookingService {
    private final ShowTimeRepository showtimeRepo;
    private final BookingSeatRepository bookingSeatRepo;
    private final SeatRepository seatRepo;
    private final SeatLayoutRepository seatLayoutRepo;

    public BookingService(SeatRepository seatRepo, ShowTimeRepository showtimeRepo, BookingSeatRepository bookingSeatRepo, SeatLayoutRepository seatLayoutRepo){
        this.seatRepo = seatRepo;
        this.showtimeRepo = showtimeRepo;
        this.bookingSeatRepo = bookingSeatRepo;
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

        
        return "standard";
    }
    public BookingResponse createBooking(Long showtimeId, List<BookingRequest.SeatRequest> requestedSeats){
        // 1 Kiem tra showtime ton tai \
        Showtime st = showtimeRepo.findByShowtimeId(showtimeId);
        if (st == null){
            throw new RuntimeException("Suất chiếu không tồn tại");
        }

        Long hallId = showtimeRepo.findHallId(showtimeId);

        List<String> codes = new ArrayList<>();
        for (BookingRequest.SeatRequest seatItem : requestedSeats){
            codes.add(seatItem.getCode());
        }
        List<Seat> validSeats = seatRepo.findSeatsByHallAndCodes(hallId, codes);
        // 2 Kiem tra ghe 
        
        if (validSeats.size() != requestedSeats.size()){
            List<String> dbSeatCodes = new ArrayList<>();
            for (Seat s : validSeats){
                dbSeatCodes.add(s.getRowLabel() + s.getSeatNumber());
            }
            List<String> invalid = new ArrayList<>(codes);
            invalid.removeAll(dbSeatCodes);

            throw new RuntimeException("Các ghế không tồn tại: " + invalid);
        }
        //3 kiem tra ghe da duoc dat chua 
        // List<String> booked = seatRepo.findBookedSeats(showtimeId, codes);

        //4 Tinh gia va build danh sach item 
        List<BookingResponse.Item> items = new ArrayList<>();

        long total = 0;
        Seat seat =null;
        String layoutJson = seatLayoutRepo.findLayoutMap(showtimeId);
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> layout = new HashMap<>();

        try {
            layout = mapper.readValue(layoutJson, Map.class);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }

        Map<String, String> seatTypes = new HashMap<>();

        if (layout.get("seat_types") != null) {
            Map<String, Object> raw = (Map<String, Object>) layout.get("seat_types");

            for (Map.Entry<String, Object> e : raw.entrySet()) {
                seatTypes.put(e.getKey(), e.getValue().toString());
            }
        }

        for(BookingRequest.SeatRequest reqSeat : requestedSeats){
            for (Seat s : validSeats){
                String code = s.getRowLabel()+s.getSeatNumber();
                if (code.equals(reqSeat.getCode())){
                    seat = s;
                    break;
                }
            }
            if (seat == null){
                throw new RuntimeException("Không tìm thấy ghế " + reqSeat.getCode());
            }
            String type = reqSeat.getType();
            String row = seat.getRowLabel();
            String zone = resolveZoneFromLayout(row, seatTypes);

            Long price = caculatePrice(zone, type);
            total += price;
            items.add(new BookingResponse.Item(req)
        }
    }
}
