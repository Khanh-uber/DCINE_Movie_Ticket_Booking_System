package com.example.cinema.service;

import java.time.format.DateTimeFormatter;
import java.util.*;

import org.springframework.stereotype.Service;
import com.example.cinema.entity.*;
import com.example.cinema.dto.BookingResponse;
import com.example.cinema.dto.ConcessionListResponse;
import com.example.cinema.dto.ConcessionResponse;
import com.example.cinema.repository.BookingRepository;
import com.example.cinema.repository.BookingSeatRepository;
import com.example.cinema.repository.ConcessionItemRepository;
import com.example.cinema.repository.ConcessionVariantRepository;
import com.example.cinema.repository.SeatLayoutRepository;
import com.example.cinema.repository.SeatTypeRepository;
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
    private final SeatTypeRepository seatTypeRepo;
    private final BookingSeatRepository bookingSeatRepo;
    public ConcessionService(ShowTimeRepository showtimeRepo, ConcessionItemRepository itemRepo, 
        ConcessionVariantRepository variantRepo,SeatLayoutRepository seatLayoutRepo,SeatTypeRepository seatTypeRepo,
                BookingRepository bookingRepo, BookingSeatRepository bookingSeatRepo ){
        this.showtimeRepo = showtimeRepo;
        this.itemRepo = itemRepo;
        this.variantRepo = variantRepo;
        this.bookingRepo = bookingRepo;
        this.seatLayoutRepo = seatLayoutRepo;
        this.seatTypeRepo = seatTypeRepo;
        this.bookingSeatRepo = bookingSeatRepo;
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


        Double basePrice  = showtimeRepo.findBasePrice(showtimeId);

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
            
            List<Map<String, Object>> seatRows = bookingSeatRepo.findSeatByBooking(booking.getBookingId());

            List<ConcessionResponse.SeatItems> seatItems = new ArrayList<>();
            
            for (Map<String, Object> row : seatRows){
                ConcessionResponse.SeatItems item = new 
            }
            
            
            
            

            
        }
        
    }
}
