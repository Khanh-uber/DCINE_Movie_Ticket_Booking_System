package com.example.cinema.service;

import java.time.format.DateTimeFormatter;
import java.util.*;

import org.springframework.stereotype.Service;
import com.example.cinema.entity.*;
import com.example.cinema.dto.ConcessionCartRequest;
import com.example.cinema.dto.ConcessionMeruRespose;
import com.example.cinema.dto.ConcessionResponse;
import com.example.cinema.repository.BookingRepository;
import com.example.cinema.repository.BookingSeatRepository;
import com.example.cinema.repository.ConcessionItemRepository;
import com.example.cinema.repository.ConcessionVariantRepository;
import com.example.cinema.repository.SeatLayoutRepository;
import com.example.cinema.repository.SeatTypeRepository;
import com.example.cinema.repository.ShowTimeRepository;


@Service
public class ConcessionService {
    private final ShowTimeRepository showtimeRepo;
    private final BookingRepository bookingRepo;
    private final SeatLayoutRepository seatLayoutRepo;
    private final SeatTypeRepository seatTypeRepo;
    private final BookingSeatRepository bookingSeatRepo;
    private final ConcessionItemRepository concessionRepo;
    private final ConcessionVariantRepository concessionVariantRepo;
    public ConcessionService(ShowTimeRepository showtimeRepo
    ,SeatLayoutRepository seatLayoutRepo,SeatTypeRepository seatTypeRepo,
                BookingRepository bookingRepo, BookingSeatRepository bookingSeatRepo ,
                ConcessionItemRepository concessionRepo,ConcessionVariantRepository concessionVariantRepo){
        this.showtimeRepo = showtimeRepo;
        this.concessionRepo = concessionRepo;
        this.bookingRepo = bookingRepo;
        this.seatLayoutRepo = seatLayoutRepo;
        this.seatTypeRepo = seatTypeRepo;
        this.bookingSeatRepo = bookingSeatRepo;
        this.concessionVariantRepo = concessionVariantRepo;
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
                ConcessionResponse.SeatItems item = new ConcessionResponse.SeatItems();
                item.setCode((String) row.get("code"));
                Long paid = ((Number) row.get("price_at_booking")).longValue();
                item.setZone(((String) row.get("zone")).toLowerCase());
                Double multiplier = ((Number) row.get("price_multiplier")).doubleValue();
                Double base = ((Number) row.get("base_price")).doubleValue();
                Double adultPrice = base * multiplier;

                String type = (paid < adultPrice) ? "child" : "adult";
                item.setType(type);
                item.setPrice(paid);
                ticketTotal += paid;
                seatItems.add(item);

            }
            

            ticketInfo.setSeatItems(seatItems);
            ticketInfo.setTotalAMount(ticketTotal);

            res.setCombos(new ArrayList<>());   
            
            ConcessionResponse.Totals totals = new ConcessionResponse.Totals();
                totals.setTicketAmount(ticketTotal);
                totals.setCombosAmount(0L);                 // chưa chọn combo => 0
                totals.setGrandTotal(ticketTotal);

            res.setTicket(ticketInfo);
            res.setTotals(totals);
        }
        return res;
    }

    public ConcessionMeruRespose getMenu(){
        ConcessionMeruRespose res = new ConcessionMeruRespose();
        
        List<ConcessionMeruRespose.Item> items = new ArrayList<>();
        
        List<ConcessionItem> combos = concessionRepo.getConcessionItemInfo();
        
        for (ConcessionItem c : combos){
            ConcessionMeruRespose.Item item = new ConcessionMeruRespose.Item();
            item.setCode(c.getCode());
            item.setCategory(c.getCategory());
            item.setDescription(c.getDescription());
            item.setId(c.getItemId());
            item.setPrice(c.getPrice());
            item.setOldPrice(c.getOldPrice());
            item.setTag(c.getTag());
            item.setImageUrl(c.getImageUrl());
            item.setCategory(c.getCategory());
            item.setActive(c.isActive());

            // variants 
            List<ConcessionVariant> vList = concessionVariantRepo.getConcessionVariantInfo(c.getItemId());
            List<ConcessionMeruRespose.Variant> variants = new ArrayList<>();
            for (ConcessionVariant v : vList){
                ConcessionMeruRespose.Variant vv = new ConcessionMeruRespose.Variant();
                vv.setId(v.getVariantId());
                vv.setLabel(v.getLabel());
                vv.setPriceDiff(v.getPriceDiff());
                vv.setValue(v.getValue());
                variants.add(vv);
            }
            item.setVariants(variants);
            items.add(item);
        }  
        res.setItems(items);
        return res; 

    }

    public ConcessionResponse updateCart(ConcessionCartRequest req){
        Long accountId = 1L;
        Booking booking = bookingRepo.findPendingBookingByAccountId(accountId);
        if (booking == null) throw new RuntimeException("Booking not found");

        
        
        // Xoa gio hang cũ
        Long bookingId = booking.getBookingId();
        bookingC

        

    }
}
