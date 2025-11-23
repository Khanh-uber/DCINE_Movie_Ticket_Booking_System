package com.example.cinema.service;

import org.springframework.stereotype.Service;
import com.example.cinema.repository.*;
@Service
public class HoldSeatService {

    private final BookingSeatRepository bookingRepo;
    private final RedisSeatService redisSeatService;

    public HoldSeatService(BookingSeatRepository bookingRepo,
                           RedisSeatService redisSeatService) {
        this.bookingRepo = bookingRepo;
        this.redisSeatService = redisSeatService;
    }

    public void processHoldAction(Long showtimeId, List<String> seats, String action) {

        if (seats == null || seats.isEmpty()) {
            throw new RuntimeException("Danh sách ghế trống");
        }

        Set<String> booked = bookingRepo.findBookedSeats(showtimeId);
        Set<String> held = redisSeatService.getHeldSeats(showtimeId);

        if ("hold".equalsIgnoreCase(action)) {

            // check xung đột
            for (String code : seats) {
                if (booked.contains(code)) {
                    throw new RuntimeException("Ghế " + code + " đã được đặt.");
                }
                if (held.contains(code)) {
                    throw new RuntimeException("Ghế " + code + " đang được giữ.");
                }
            }

            redisSeatService.holdSeats(showtimeId, seats);
        }
        else if ("release".equalsIgnoreCase(action)) {
            redisSeatService.releaseSeats(showtimeId, seats);
        }
        else {
            throw new RuntimeException("Action không hợp lệ. Chỉ dùng 'hold' hoặc 'release'.");
        }
    }
}

