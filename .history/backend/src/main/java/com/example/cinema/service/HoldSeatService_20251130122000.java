package com.example.cinema.service;

import org.springframework.stereotype.Service;

import com.example.cinema.dto.HoldSeatRequest;
import com.example.cinema.repository.*;
import java.util.*;
@Service
public class HoldSeatService {

    private final BookingSeatRepository bookingRepo;
    private final RedisSeatService redisSeatService;


    public HoldSeatService(BookingSeatRepository bookingRepo,
                           RedisSeatService redisSeatService) {
        this.bookingRepo = bookingRepo;
        this.redisSeatService = redisSeatService;
    }

    public void processHoldAction(Long showtimeId,Long accountId ,List<String> seats, String action) {
        if (seats == null || seats.isEmpty()) {
            throw new RuntimeException("Danh sách ghế trống");
        }

        List<String> seatCodes = new ArrayList<>(seats);

        Set<String> booked = bookingRepo.findBookedSeats(showtimeId);

        Set<String> heldByOthers  = redisSeatService.getHeldSeatsExceptUser(showtimeId, accountId);

        if ("hold".equalsIgnoreCase(action)) {

            // Check conflict
            for (String code : seatCodes) {

                if (booked.contains(code)) {
                    throw new RuntimeException("Ghế " + code + " đã được đặt.");
                }

                if (heldByOthers.contains(code)) {
                    throw new RuntimeException("Ghế " + code + " đang được giữ bởi khách khác.");
                }
            }

            // Giữ ghế cho user hiện tại
            redisSeatService.holdForUser(showtimeId, accountId, seatCodes);
        }
        else if ("release".equalsIgnoreCase(action)) {
            // Trả ghế lại cho user hiện tại
            redisSeatService.releaseForUser(showtimeId, accountId, seatCodes);
        }
        else {
            throw new RuntimeException("Action không hợp lệ. Chỉ dùng 'hold' hoặc 'release'.");
        }
    }
}

