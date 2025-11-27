package com.example.cinema.service;

import java.time.format.DateTimeFormatter;
import java.util.*;

import org.springframework.stereotype.Service;
import com.example.cinema.entity.*;
import com.example.cinema.dto.ConcessionListResponse;
import com.example.cinema.dto.ConcessionResponse;
import com.example.cinema.repository.BookingRepository;
import com.example.cinema.repository.ConcessionItemRepository;
import com.example.cinema.repository.ConcessionVariantRepository;
import com.example.cinema.repository.ShowTimeRepository;

@Service
public class ConcessionService {
    private final ShowTimeRepository showtimeRepo;
    private final ConcessionItemRepository itemRepo;
    private final ConcessionVariantRepository variantRepo;
    private final BookingRepository bookingRepo;
    public ConcessionService(ShowTimeRepository showtimeRepo, ConcessionItemRepository itemRepo, 
        ConcessionVariantRepository variantRepo,
        BookingRepository bookingRepo){
        this.showtimeRepo = showtimeRepo;
        this.itemRepo = itemRepo;
        this.variantRepo = variantRepo;
        this.bookingRepo = bookingRepo;
    }
    public ConcessionResponse.SeatItems calculate(Lis<)
    public ConcessionResponse loadSummary(){
        ConcessionResponse res = new ConcessionResponse();

        // 1) Load BookingId theo account
        Long accountId = 1L;     // * CHI TEST 1 USER


        // Build TicketInfo
        Booking booking = bookingRepo.findPendingBookingByAccountId(accountId);
        
        long ticketTotal = 0;
        
        ConcessionResponse.TicketInfo ticketInfo = new ConcessionResponse.TicketInfo();
        Long showtimeId = booking.getShowtimeId();
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
            
            List<ConcessionResponse.SeatItems> seatItems = new ArrayList<>();
            
            
            

            
        }
        
    }
}
