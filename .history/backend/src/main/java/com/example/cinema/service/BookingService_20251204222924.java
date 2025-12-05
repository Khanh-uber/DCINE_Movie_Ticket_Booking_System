package com.example.cinema.service;

import org.springframework.stereotype.Service;
import com.example.cinema.entity.*;
import com.example.cinema.dto.BookingRequest;
import com.example.cinema.dto.BookingResponse;
import com.example.cinema.dto.ConcessionResponse;
import com.example.cinema.repository.BookingConcessionRepository;
import com.example.cinema.repository.BookingRepository;
import com.example.cinema.repository.BookingSeatRepository;
import com.example.cinema.repository.PaymentRepository;
import com.example.cinema.repository.SeatLayoutRepository;
import com.example.cinema.repository.SeatRepository;
import com.example.cinema.repository.SeatTypeRepository;
import com.example.cinema.repository.ShowTimeRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpSession;
import jakarta.transaction.Transactional;

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
    private final PaymentRepository paymentRepo;

    
    public BookingService(SeatRepository seatRepo, ShowTimeRepository showtimeRepo, BookingSeatRepository bookingSeatRepo, 
        SeatLayoutRepository seatLayoutRepo, SeatTypeRepository seatTypeRepo, BookingRepository bookingRepo, 
        RedisSeatService redisSeatService, HttpSession session, ConcessionService concessionService,BookingConcessionRepository bookingConcessionRepo,
        PaymentRepository paymentRepo){
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
        this.paymentRepo= paymentRepo;
        
    }
    @Transactional
    public BookingResponse createBooking(Long showtimeId, Long accountId, BookingRequest req){
        List<Booking> pendingList = bookingRepo.findAllPendingByAccountId(accountId);

        for (Booking b : pendingList) {

            boolean hasPayment = (paymentRepo.existsByBooking(b.getBookingId())==1);

            if (hasPayment) {
                // Không được xóa booking này → chỉ đổi trạng thái
                b.setStatus("CANCELLED");
                bookingRepo.save(b);
                continue;
            }

            // Chỉ xóa booking nếu không có payment
            bookingSeatRepo.deleteSeatsByBookingId(b.getBookingId());
            bookingRepo.deletePendingBookingById(b.getBookingId());
        }
        

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
            throw new RuntimeException("Ghế đang được người khác giữ: " + heldOthers);
        }
        Map<String, String> typeMap = new HashMap<>();
        if (req.getSeats() != null) {
            for (BookingRequest.SeatRequest s : req.getSeats()) {
                if (s != null && s.getCode() != null) {
                    typeMap.put(s.getCode(), s.getType());
                }
            }
        }  
        Booking booking = new Booking();
        booking.setAccountId(accountId);
        booking.setShowtimeId(showtimeId);
        booking.setStatus("PENDING");
        booking.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        booking.setTotalAmount(0L);
        booking = bookingRepo.save(booking);
        

        Double basePrice  = showtimeRepo.findBasePrice(showtimeId);
        

        // 6) Build booking Items 
        long total = 0;
        List<BookingResponse.Item> items = new ArrayList<>();
        

        for (String code : codes) {
            Seat seat = seatRepo.findSeatByCodeAndShowtime(showtimeId, code);
            if (seat == null) continue;

            Map<String, Object> mulMap = seatTypeRepo.getZonePrice(seat.getSeatTypeId());
            String zone = ((String) mulMap.get("name")).toLowerCase();
            Double price_mul = ((Number) mulMap.get("price_multiplier")).doubleValue();

            String type = typeMap.getOrDefault(code, "adult");
            Double price = basePrice * price_mul;
            if (type.equals("child")) {
                price *= 0.8;  // giảm 20%
            }
            Long finalPrice = Math.round(price);
            total += finalPrice;

            // insert booking_seat
            Long seatId = seat.getSeatId();
            BookingSeatKey key = new BookingSeatKey(booking.getBookingId(), seatId);

            BookingSeat bs = new BookingSeat();
            bs.setId(key);
            bs.setPriceAtBooking(finalPrice);
            bookingSeatRepo.save(bs);

            items.add(new BookingResponse.Item(code, zone, type, finalPrice));
        }
        
        // XÓA GHẾ ĐANG GIỮ TRONG REDIS
        redisSeatService.clearForUser(showtimeId, accountId);

        // 7) UPDATE TOTAL VÀ TRẢ VỀ
        booking.setTotalAmount(total);
        bookingRepo.save(booking);

        BookingResponse res = new BookingResponse();
        res.setBookingId(booking.getBookingId()); 
        res.setStatus("PENDING");
        res.setItems(items);
        res.setTotalAmount(total);

            return res;
    }
}
