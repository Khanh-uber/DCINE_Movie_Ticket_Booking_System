package com.example.cinema.service;

import org.springframework.stereotype.Service;
import com.example.cinema.entity.*;
import com.example.cinema.dto.BookingRequest;
import com.example.cinema.dto.BookingResponse;
import com.example.cinema.repository.BookingRepository;
import com.example.cinema.repository.BookingSeatRepository;
import com.example.cinema.repository.SeatLayoutRepository;
import com.example.cinema.repository.SeatRepository;
import com.example.cinema.repository.SeatTypeRepository;
import com.example.cinema.repository.ShowTimeRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.sql.Timestamp;
import java.util.*;
@Service
public class BookingService {
    private final ShowTimeRepository showtimeRepo;
    private final SeatRepository seatRepo;
    private final SeatLayoutRepository seatLayoutRepo;
    private final BookingRepository bookingRepo;
    private final SeatTypeRepository seatTypeRepo;
    

    public BookingService(SeatRepository seatRepo, ShowTimeRepository showtimeRepo, BookingSeatRepository bookingSeatRepo, 
        SeatLayoutRepository seatLayoutRepo, SeatTypeRepository seatTypeRepo, BookingRepository bookingRepo){
        this.seatRepo = seatRepo;
        this.showtimeRepo = showtimeRepo;
        this.seatLayoutRepo = seatLayoutRepo;
        this.seatTypeRepo = seatTypeRepo;
        this.bookingRepo = bookingRepo;
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
        // 1 Kiem tra showtime ton tai 
        Showtime st = showtimeRepo.findByShowtimeId(showtimeId);
        if (st == null){
            throw new RuntimeException("Suất chiếu không tồn tại");
        }
        Long hallId = showtimeRepo.findHallId(showtimeId);

        // 2) Kiểm tra ghế có tồn tại không
        List<String> codes = new ArrayList<>();
        for (BookingRequest.SeatRequest seatItem : requestedSeats){
            codes.add(seatItem.getCode());
        }
        /*
        [
        {
    seatId: 101,
    rowLabel: "A",
    seatNumber: 1,
    hallId: 5,
    seatTypeId: 1
  },
  {
    seatId: 102,
    rowLabel: "A",
    seatNumber: 2,
    hallId: 5,
    seatTypeId: 1
  }
        ]
         */
        List<Seat> validSeats = seatRepo.findSeatsByHallAndCodes(hallId, codes);
        
        if (validSeats.size() != requestedSeats.size()){
            List<String> dbSeatCodes = new ArrayList<>();
            for (Seat s : validSeats){
                dbSeatCodes.add(s.getRowLabel() + s.getSeatNumber());
            }
            List<String> invalid = new ArrayList<>(codes);
            invalid.removeAll(dbSeatCodes);
            throw new RuntimeException("Các ghế không tồn tại: " + invalid);
        }
        // 3) Kiểm tra ghế đã được đặt(BOOKED) hay chưa
        Set<String> bookedSeats = bookingSeatRepo.findBookedSeats(showtimeId, codes);
        if (!bookedSeats.isEmpty()) {
            throw new RuntimeException("Ghế đã được đặt: " + bookedSeats);
        }

        // 4) Kiểm tra ghế đang (PENDING) không
        Set<String> pendingSeats = bookingSeatRepo.findPendingSeats(showtimeId, codes);
        if (!pendingSeats.isEmpty()) {
            throw new RuntimeException("Ghế đang được giữ (pending): " + pendingSeats);
        }
        // 5) Validate HELD seats (Redis)
        Set<String> heldSeats = redisSeatService.getHeldSeats(showtimeId);
        heldSeats.retainAll(codes);
        if (!heldSeats.isEmpty()) {
            throw new RuntimeException("Ghế đang được giữ tạm thời (held): " + heldSeats);
        }

        // 6) Tinh giá và build danh sách item 
        List<BookingResponse.Item> items = new ArrayList<>();
        long total = 0;
        
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

        /* Tạo bảng giá 
        [{"name" : vip, "price_multi":1.1}, {{"name" : "standard", "price_multi":1.0}, 
                {{"name" : couple, "price_multi":1.2}]
        */
        List<Map<String, Object>> priceRows = seatTypeRepo.findPricingByHall(hallId);
        Map<String, Double> mulMap = new HashMap<>();
        for (Map<String, Object> r : priceRows){
            String code = r.get("name").toString().toLowerCase();
            Double mul = ((Number) r.get("price_multiplier")).doubleValue();
            mulMap.put(code, mul);
        }
        Double basePrice  = showtimeRepo.findBasePrice(showtimeId);

        // 8) Build booking Items 
        List<BookingResponse.Item> Items = new ArrayList<>();
        for (BookingRequest.SeatRequest reqSeat : requestedSeats){
            
            for(Seat s : validSeats){

            }
            
        }
        Booking booking = new Booking();
        booking.setAccountId(null);
        booking.setShowtimeId(showtimeId);
        booking.setTotalAmount(total);
        booking.setStatus("PENDING");
        booking.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        booking = bookingRepo.save(booking);

        Long bookingId = booking.getBookingId();

        BookingResponse res = new BookingResponse();
        res.setBookingId(bookingId);
        res.setStatus("PENDING");
        res.setItems(items);
        res.setTotalAmount(total);

        return res;
    }
    private Long caculatePrice(SeatTypeRepository repo, Double basePrice,String zone, String type){
        SeatType seatType = repo.findByName(zone.toLowerCase());

        if (seatType == null) {
        // fallback nếu không có trong DB → standard = 1.0
            seatType = new SeatType();
            seatType.setPriceMultiplier(1.0);
        }

        Double mul = seatType.getPriceMultiplier();
        double price = basePrice * mul;

        // Trẻ em giảm 20%
        if ("child".equalsIgnoreCase(type)) {
            price = price * 0.8;
        }

        return Math.round(price);
    }
}
