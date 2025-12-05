package com.example.cinema.service;

import java.time.format.DateTimeFormatter;
import java.util.*;

import org.springframework.stereotype.Service;
import com.example.cinema.entity.*;
import com.example.cinema.dto.ConcessionCartRequest;
import com.example.cinema.dto.ConcessionMeruRespose;
import com.example.cinema.dto.ConcessionResponse;
import com.example.cinema.repository.BookingConcessionRepository;
import com.example.cinema.repository.BookingRepository;
import com.example.cinema.repository.BookingSeatRepository;
import com.example.cinema.repository.ConcessionItemRepository;
import com.example.cinema.repository.ConcessionVariantRepository;
import com.example.cinema.repository.SeatLayoutRepository;
import com.example.cinema.repository.SeatTypeRepository;
import com.example.cinema.repository.ShowTimeRepository;

import jakarta.transaction.Transactional;

@Service
public class ConcessionService {
    private final ShowTimeRepository showtimeRepo;
    private final BookingRepository bookingRepo;
    private final BookingSeatRepository bookingSeatRepo;
    private final ConcessionItemRepository concessionRepo; // Dùng để get menu
    private final ConcessionVariantRepository concessionVariantRepo;
    private final BookingConcessionRepository bookingConcessionRepo;
    private final ConcessionItemRepository concessionItemRepo; // Dùng để tìm item info

    public ConcessionService(ShowTimeRepository showtimeRepo,
                            SeatLayoutRepository seatLayoutRepo, SeatTypeRepository seatTypeRepo,
                            BookingRepository bookingRepo, BookingSeatRepository bookingSeatRepo,
                            ConcessionItemRepository concessionRepo, ConcessionVariantRepository concessionVariantRepo,
                            BookingConcessionRepository bookingConcessionRepo, ConcessionItemRepository concessionItemRepo){
        this.showtimeRepo = showtimeRepo;
        this.concessionRepo = concessionRepo;
        this.bookingRepo = bookingRepo;
        this.bookingSeatRepo = bookingSeatRepo;
        this.concessionVariantRepo = concessionVariantRepo;
        this.bookingConcessionRepo = bookingConcessionRepo;
        this.concessionItemRepo = concessionItemRepo;
    }
    @Transactional
    public ConcessionResponse loadSummary(Long accountId){
        ConcessionResponse res = new ConcessionResponse();

        Booking booking = bookingRepo.getPendingBooking(accountId);
        if (booking == null) {
            res.setTicket(null);
            res.setCombos(Collections.emptyList());
            res.setTotals(null);
            return res;
        }
        System.out.println(">>> Pending Booking ID = " + booking.getBookingId());
        System.out.println(">>> OLD total_amount = " + booking.getTotalAmount());
        long ticketTotal = 0;
        Double combosTotal = 0.0; 
        
        ConcessionResponse.TicketInfo ticketInfo = new ConcessionResponse.TicketInfo();
        Long showtimeId = booking.getShowtimeId();
        Map<String, Object> showtimeMeta = showtimeRepo.getShowtimeMeta(showtimeId);
        
        if (booking != null){
            ticketInfo.setShowtimeId(showtimeId);
            ticketInfo.setDate(((java.sql.Date) showtimeMeta.get("date")).toLocalDate().toString());
            java.sql.Time sqlTime = (java.sql.Time) showtimeMeta.get("time");
            String time = (sqlTime != null)
                    ? sqlTime.toLocalTime().format(DateTimeFormatter.ofPattern("HH:mm"))
                    : "";
            ticketInfo.setTime(time);
            java.sql.Time sqlEndTime = (java.sql.Time) showtimeMeta.get("end_at");
            String endTime = (sqlEndTime != null)
                    ? sqlEndTime.toLocalTime().format(DateTimeFormatter.ofPattern("HH:mm"))
                    : "";
            ticketInfo.setEndTime(endTime); 

            ticketInfo.setMovieTitle((String) showtimeMeta.get("movieTitle"));
            ticketInfo.setTheaterName((String) showtimeMeta.get("theaterName"));
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
            ticketInfo.setTotalAmount(ticketTotal);

            List<Map<String, Object>> comboRows = bookingConcessionRepo.findByBookingId(booking.getBookingId());
            List<ConcessionResponse.ComboItem> comboItems = new ArrayList<>();
            
            if (comboRows != null) {
                for (Map<String, Object> row : comboRows) {
                    Long itemId = ((Number) row.get("item_id")).longValue();
                    Integer qty = ((Number) row.get("quantity")).intValue();
                    Double totalPrice = ((Number) row.get("total_price")).doubleValue();

                    Map<String, Object> itemInfo = concessionItemRepo.findItemInfo(itemId);

                    ConcessionResponse.ComboItem ci = new ConcessionResponse.ComboItem();
                    ci.setComboId(itemId);
                    ci.setTitle((String) itemInfo.get("title"));
                    ci.setCode((String) itemInfo.get("code")); 

                    ci.setQty(qty);
                    ci.setLineTotal(totalPrice);
                    
                    Double unitPrice = (qty > 0) ? totalPrice / qty : 0.0;
                    ci.setUnitPrice(unitPrice);
                    
                    // Tìm variant label
                    Map<String, Object> variantRow = concessionVariantRepo.findByItemIdAndUnitPrice(itemId, unitPrice);
                    ci.setImageUrl((String) itemInfo.get("image_url"));
                    
                    if (variantRow != null) {
                        ci.setVariant((String) variantRow.get("value"));
                        ci.setVariantLabel((String) variantRow.get("label"));
                    } else {
                        ci.setVariant("");
                        ci.setVariantLabel("");
                    }

                    comboItems.add(ci);
                    combosTotal += totalPrice;
                }
            }
            res.setCombos(comboItems);
            
            ConcessionResponse.Totals totals = new ConcessionResponse.Totals();
            totals.setTicketAmount(ticketTotal);
            totals.setCombosAmount(combosTotal.longValue());
            totals.setGrandTotal(ticketTotal + combosTotal.longValue());

            
            
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
            item.setActive(c.isActive());

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

    public ConcessionResponse updateCart(ConcessionCartRequest req, Long accountId){
        Booking booking = bookingRepo.getPendingBooking(accountId);
        if (booking == null) 
            throw new RuntimeException("Không tìm thấy booking");
        
        Long bookingId = booking.getBookingId();
        // Xóa giỏ hàng cũ trong DB để lưu mới
        bookingConcessionRepo.deleteByBookingId(bookingId);
        
        List<ConcessionResponse.ComboItem> comboItems = new ArrayList<>();
        Long combosAmount = 0L;
        
        if (req != null && req.getItems() != null) {
            for(ConcessionCartRequest.CartItem it : req.getItems()){
                if (it == null || it.getQty() <= 0) continue;

                Long itemId = it.getComboId();
                if (itemId == null) continue;
                String variant = it.getVariant();

                Map<String, Object> row = concessionItemRepo.findItemInfo(itemId);
                Double basePrice = ((Number) row.get("price")).doubleValue();

                Map<String, Object> variantRow = concessionVariantRepo.findByItemIdAndValue(itemId, variant);
                Long priceDiff = 0L;
                if (variantRow != null && variantRow.get("price_diff") != null) {
                    priceDiff = ((Number) variantRow.get("price_diff")).longValue();
                }
                
                Double unitPrice = basePrice + priceDiff;
                Double totalPrice = (unitPrice * it.getQty());

                bookingConcessionRepo.insertItem(
                        bookingId,
                        itemId,
                        it.getQty(),
                        totalPrice
                );

                ConcessionResponse.ComboItem dto = new ConcessionResponse.ComboItem();
                dto.setComboId(itemId);
                dto.setCode((String) row.get("code"));
                dto.setTitle((String) row.get("title"));
                dto.setImageUrl((String) row.get("image_url")); 
                dto.setVariant(variant);
                
                String vLabel = (variantRow != null) ? (String) variantRow.get("label") : "";
                dto.setVariantLabel(vLabel);
                
                dto.setUnitPrice(unitPrice);
                dto.setQty(it.getQty());
                dto.setLineTotal(totalPrice);
                
                combosAmount += totalPrice.longValue();
                comboItems.add(dto);
            }
        }
        
        ConcessionResponse res = new ConcessionResponse();
        res.setCombos(comboItems);

        // --- TÍNH LẠI TOTALS ---
        Long ticketTotal = 0L;
        ConcessionResponse.TicketInfo ticketInfo = new ConcessionResponse.TicketInfo();
        Long showtimeId = booking.getShowtimeId();
        Map<String, Object> showtimeMeta = showtimeRepo.getShowtimeMeta(showtimeId);
        
        if (booking != null){
            ticketInfo.setShowtimeId(showtimeId);
            ticketInfo.setDate(((java.sql.Date) showtimeMeta.get("date")).toLocalDate().toString());
            
            java.sql.Time sqlTime = (java.sql.Time) showtimeMeta.get("time");
            String time = (sqlTime != null) ? sqlTime.toLocalTime().format(DateTimeFormatter.ofPattern("HH:mm")) : "";
            ticketInfo.setTime(time);
            
            // Set end_at cho updateCart (để nhất quán response)
            java.sql.Time sqlEndTime = (java.sql.Time) showtimeMeta.get("end_at");
            String endTime = (sqlEndTime != null) ? sqlEndTime.toLocalTime().format(DateTimeFormatter.ofPattern("HH:mm")) : "";
            ticketInfo.setEndTime(endTime);

            ticketInfo.setMovieTitle((String) showtimeMeta.get("movieTitle"));
            ticketInfo.setTheaterName((String) showtimeMeta.get("theaterName"));
            
            List<Map<String, Object>> seatRows = bookingSeatRepo.findSeatByBooking(booking.getBookingId());
            List<ConcessionResponse.SeatItems> seatItems = new ArrayList<>();
            
            for (Map<String, Object> seatRow : seatRows){
                ConcessionResponse.SeatItems item = new ConcessionResponse.SeatItems();
                item.setCode((String) seatRow.get("code"));
                Long paid = ((Number) seatRow.get("price_at_booking")).longValue();
                item.setZone(((String) seatRow.get("zone")).toLowerCase());
                
                // ... logic tính giá vé ...
                Double multiplier = ((Number) seatRow.get("price_multiplier")).doubleValue();
                Double base = ((Number) seatRow.get("base_price")).doubleValue();
                Double adultPrice = base * multiplier;
                String type = (paid < adultPrice) ? "child" : "adult";
                
                item.setType(type);
                item.setPrice(paid);
                ticketTotal += paid;
                seatItems.add(item);
            }
            ticketInfo.setSeatItems(seatItems);
            ticketInfo.setTotalAmount(ticketTotal);
        }
        res.setTicket(ticketInfo);
        
        ConcessionResponse.Totals totals = new ConcessionResponse.Totals();
        totals.setCombosAmount(combosAmount);
        totals.setTicketAmount(ticketTotal);
        totals.setGrandTotal(combosAmount + ticketTotal);
        res.setTotals(totals);

        booking.setTotalAmount(ticketTotal + combosAmount.longValue());
        bookingRepo.save(booking);
        System.out.println(">>> tiket_total = " + ticketTotal);
        System.out.println(">>> NEW total_amount = " + booking.getTotalAmount());
        return res;
    }
}