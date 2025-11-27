package com.example.cinema.service;

import java.time.format.DateTimeFormatter;
import java.util.*;

import org.springframework.stereotype.Service;
import com.example.cinema.entity.*;
import com.example.cinema.dto.BookingResponse;
import com.example.cinema.dto.ConcessionListResponse;
import com.example.cinema.dto.ConcessionResponse;
import com.example.cinema.repository.BookingRepository;
import com.example.cinema.repository.ConcessionItemRepository;
import com.example.cinema.repository.ConcessionVariantRepository;
import com.example.cinema.repository.SeatLayoutRepository;
import com.example.cinema.repository.ShowTimeRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class ConcessionService {
    private final ShowTimeRepository showtimeRepo;
    private final ConcessionItemRepository itemRepo;
    private final ConcessionVariantRepository variantRepo;
    private final BookingRepository bookingRepo;
    private final SeatLayoutRepository seatLayoutRepo;
    public ConcessionService(ShowTimeRepository showtimeRepo, ConcessionItemRepository itemRepo, 
        ConcessionVariantRepository variantRepo,SeatLayoutRepository seatLayout,
        BookingRepository bookingRepo){
        this.showtimeRepo = showtimeRepo;
        this.itemRepo = itemRepo;
        this.variantRepo = variantRepo;
        this.bookingRepo = bookingRepo;
        this.seatLayoutRepo = seatLayoutRepo;
    }
    public ConcessionResponse loadSummary(){
        ConcessionResponse res = new ConcessionResponse();

        // 1) Load BookingId theo account
        Long accountId = 1L;     // * CHI TEST 1 USER


        // Build TicketInfo
        Booking booking = bookingRepo.findPendingBookingByAccountId(accountId);
        
        long ticketTotal = 0;
        
        ConcessionResponse.TicketInfo ticketInfo = new ConcessionResponse.TicketInfo();
        Long showtimeId = booking.getShowtimeId();

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
        Map<String, Object> showtimeMeta = showtimeRepo.getShowtimeMeta(showtimeId);
        if (booking != null){
            ticketInfo.setShowtimeId(showtimeId);
            ticketInfo.setDate(((java.sql.Date) showtimeMeta.get("date")).toLocalDate().toString());
            java.sql.Time sqlTime = (java.sql.Time) showtimeMeta.get("time");
            String time = (sqlTime != null)
                    ? sqlTime.toLocalTime().format(DateTimeFormatter.ofPattern("HH:mm"))
                    : null;
            ticketInfo.setTime(time);
            ticketInfo.setMovieTitle((String) showtimeMeta.get("movieTitle"));
            

            
            
            
            

            
        }
        
    }
}
