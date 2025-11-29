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
    public BookingResponse createBooking(Long showtimeId, Long accountId){
        // Long accountId = (Long) session.getAttribute("accountId");
        // if (accountId == null) {
        //     throw new RuntimeException("Bạn chưa đăng nhập");
        // }
        // 1 Kiem tra showtime ton tai 
        Showtime st = showtimeRepo.findByShowtimeId(showtimeId);
        if (st == null){
            throw new RuntimeException("Suất chiếu không tồn tại");
        }
        // 2. Lấy ghế từ Redis (pending seats)
        Set<String> pendingSeats = redisSeatService.getHeldSeatsForUser(showtimeId, accountId);
        if (pendingSeats.isEmpty()) {
            throw new RuntimeException("Bạn chưa chọn ghế hoặc ghế đã hết hạn giữ.");
        }

        List<String> codes = new ArrayList<>(pendingSeats);
        
        
        // 3) Kiểm tra ghế đã được đặt(BOOKED) hay chưa
        Set<String> bookedSeats = bookingSeatRepo.findBookedSeats(showtimeId, codes);
        if (!bookedSeats.isEmpty()) {
            throw new RuntimeException("Ghế đã được đặt: " + bookedSeats);
        }

        // 4) Kiểm tra ghế đang (PENDING) không
        Set<String> heldOthers = redisSeatService.getHeldSeatsExceptUser(showtimeId, accountId);
        if (!heldOthers.isEmpty()) {
            throw new RuntimeException("Ghế đang được giữ (pending): " + pendingSeats);
        }

        Booking booking = bookingRepo.findLatestPending(accountId);
        if (booking == null) {
            booking = new Booking();
            booking.setAccountId(accountId);
            booking.setShowtimeId(showtimeId);
            booking.setStatus("PENDING");
            booking.setCreatedAt(new Timestamp(System.currentTimeMillis()));
            booking = bookingRepo.save(booking);
        } else {
            // update booking: xóa ghế cũ
            bookingSeatRepo.deleteSeatsByBookingId(booking.getBookingId());
        }

        // 5) Tinh giá và build danh sách item 
        Double basePrice  = showtimeRepo.findBasePrice(showtimeId);

        // String layoutJson = seatLayoutRepo.findLayoutMap(showtimeId);
        // ObjectMapper mapper = new ObjectMapper();
        // Map<String, Object> layout = new HashMap<>();
        // try {
        //     layout = mapper.readValue(layoutJson, Map.class);
        // } catch (JsonProcessingException e) {
        //     e.printStackTrace();
        // }

        // Map<String, String> seatTypes = new HashMap<>();

        // if (layout.get("seat_types") != null) {
        //     Map<String, Object> raw = (Map<String, Object>) layout.get("seat_types");

        //     for (Map.Entry<String, Object> e : raw.entrySet()) {
        //         seatTypes.put(e.getKey(), e.getValue().toString());
        //     }
        // }

        // /* Tạo bảng giá 
        // [{"name" : vip, "price_multi":1.1}, {{"name" : "standard", "price_multi":1.0}, 
        //         {{"name" : couple, "price_multi":1.2}]
        // */
        // Long hallId = showtimeRepo.findHallId(showtimeId);
        // List<Map<String, Object>> priceRows = seatTypeRepo.findPricingByHall(hallId);
        // Map<String, Double> mulMap = new HashMap<>();
        // for (Map<String, Object> r : priceRows){
        //     String code = r.get("name").toString().toLowerCase();
        //     Double mul = ((Number) r.get("price_multiplier")).doubleValue();
        //     mulMap.put(code, mul);
        // }
        

        // 6) Build booking Items 
        long total = 0;
        List<BookingResponse.Item> Items = new ArrayList<>();
        List<Map<String, Object>> seatRows = bookingSeatRepo.findSeatByBooking(booking.getBookingId());

        for (String code : codes) {
            Long hallId = showtimeRepo.findHallId(showtimeId);
            Seat seat = seatRepo.findSeatByCodeAndShowtime(showtimeId, code);
            if (seat == null) continue;

            String row = seat.getRowLabel();
            String zone = 

            Double price = basePrice 
        long finalPrice = Math.round(price);
        total += finalPrice;

        // insert booking_seat
        Long seatId = seat.getSeatId();
        BookingSeatKey key = new BookingSeatKey(bookingId, seatId);

        BookingSeat bs = new BookingSeat();
        bs.setId(key);
        bs.setPriceAtBooking(finalPrice);
        bookingSeatRepo.save(bs);

        items.add(new BookingResponse.Item(code, zone, "adult", finalPrice));
    }
        
        

        // =======================
    // 7) UPDATE TOTAL VÀ TRẢ VỀ
    // =======================
    booking.setTotalAmount(total);
    bookingRepo.save(booking);

    BookingResponse res = new BookingResponse();
    res.setBookingId(bookingId);
    res.setStatus("PENDING");
    res.setItems(items);
    res.setTotalAmount(total);

    return res;
    }
    
}
