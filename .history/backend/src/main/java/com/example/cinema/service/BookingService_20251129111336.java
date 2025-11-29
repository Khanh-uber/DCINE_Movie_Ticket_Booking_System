package com.example.cinema.service;

import org.springframework.stereotype.Service;
import com.example.cinema.entity.*;
import com.example.cinema.dto.BookingRequest;
import com.example.cinema.dto.BookingResponse;
import com.example.cinema.dto.ConcessionResponse;
import com.example.cinema.repository.BookingConcessionRepository;
import com.example.cinema.repository.BookingRepository;
import com.example.cinema.repository.BookingSeatRepository;
import com.example.cinema.repository.SeatLayoutRepository;
import com.example.cinema.repository.SeatRepository;
import com.example.cinema.repository.SeatTypeRepository;
import com.example.cinema.repository.ShowTimeRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpSession;

import java.sql.Timestamp;
import java.util.*;
@Service
public class BookingService {
    private final ShowTimeRepository showtimeRepo;
    private final SeatRepository seatRepo;
    private final SeatLayoutRepository seatLayoutRepo;
    private final BookingRepository bookingRepo;
    private final SeatTypeRepository seatTypeRepo;
    private final BookingSeatRepository bookingSeatRepo;
    private final RedisSeatService redisSeatService;
    private final HttpSession session;
    private final ConcessionService concessionService;
    private final BookingConcessionRepository bookingConcessionRepo;

    public BookingService(SeatRepository seatRepo, ShowTimeRepository showtimeRepo, BookingSeatRepository bookingSeatRepo, 
        SeatLayoutRepository seatLayoutRepo, SeatTypeRepository seatTypeRepo, BookingRepository bookingRepo, 
        RedisSeatService redisSeatService, HttpSession session, ConcessionService concessionService,BookingConcessionRepository bookingConcessionRepo){
        this.seatRepo = seatRepo;
        this.showtimeRepo = showtimeRepo;
        this.seatLayoutRepo = seatLayoutRepo;
        this.seatTypeRepo = seatTypeRepo;
        this.bookingRepo = bookingRepo;
        this.bookingSeatRepo = bookingSeatRepo;
        this.redisSeatService = redisSeatService;
        this.session = session;
        this.concessionService = concessionService;
        this.bookingConcessionRepo = bookingConcessionRepo;
        
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
        // Long accountId = (Long) session.getAttribute("accountId");
        // if (accountId == null) {
        //     throw new RuntimeException("Bạn chưa đăng nhập");
        // }

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
        // Set<String> heldSeats = redisSeatService.getHeldSeats(showtimeId);
        // heldSeats.retainAll(codes);
        // if (!heldSeats.isEmpty()) {
        //     throw new RuntimeException("Ghế đang được giữ tạm thời (held): " + heldSeats);
        // }

        // 6) Tinh giá và build danh sách item 
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
            Seat seat = null;   
            for(Seat s : validSeats){
                String code = s.getRowLabel() + s.getSeatNumber();
                if (code.equals(reqSeat.getCode())){
                    seat = s;
                    break;
                }
            }
            if (seat == null) throw new RuntimeException("Không tìm thấy ghế " + reqSeat.getCode());
            String row = seat.getRowLabel();
            String zone = resolveZoneFromLayout(row, seatTypes);
            String type = reqSeat.getType();
            double multiplier = mulMap.getOrDefault(zone, 1.0);
            double price = basePrice * multiplier;
            if (type.equalsIgnoreCase("child")) price *= 0.8;

            long finalPrice = Math.round(price);
            total += finalPrice;

            Items.add(new BookingResponse.Item(reqSeat.getCode(), zone, type, finalPrice));
        }

        // 9) Insert Booking 
        // Xoá booking pending cũ
        Booking old = bookingRepo.findLatestPending(1L);

        if (old != null) {
            bookingSeatRepo.deleteSeatsByBookingId(old.getBookingId());
            bookingRepo.deleteBookingById(old.getBookingId());
        }

        Booking booking = new Booking();
        booking.setAccountId(1L);
        booking.setShowtimeId(showtimeId);
        booking.setTotalAmount(total);
        booking.setStatus("PENDING");
        booking.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        booking = bookingRepo.save(booking);

        

        // 10) Insert Booking_Seat
        Long bookingId = booking.getBookingId();
        for(BookingResponse.Item it : Items){
            Long seatId = seatRepo.findSeatIdByCode(hallId, it.getCode());
            BookingSeatKey key = new BookingSeatKey(bookingId, seatId);
            BookingSeat bs = new BookingSeat();
            bs.setId(key);
            bs.setPriceAtBooking(it.getPrice());
            bookingSeatRepo.save(bs);
        }
        BookingResponse res = new BookingResponse();
        res.setBookingId(bookingId);
        res.setStatus("PENDING");
        res.setItems(Items);
        res.setTotalAmount(total);

        return res; 
    }
    public void calculateFinalTotal(Long bookingId) {

        Booking booking = bookingRepo.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking không tồn tại"));

        Long seatTotal = bookingSeatRepo.sumSeatTotal(bookingId);
        if (seatTotal == null) seatTotal = 0L;

        Long comboTotal = bookingConcessionRepo.sumComboTotal(bookingId);
        if (comboTotal == null) comboTotal = 0L;

        Long discount = voucherRepo.sumDiscount(bookingId);
        if (discount == null) discount = 0L;

        Long finalTotal = seatTotal + comboTotal - discount;
        if (finalTotal < 0) finalTotal = 0L;

        booking.setTotalAmount(finalTotal);
        bookingRepo.save(booking);
    }
}
