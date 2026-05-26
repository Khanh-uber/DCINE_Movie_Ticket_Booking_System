package com.example.cinema.service;

import org.springframework.stereotype.Service;

import com.example.cinema.dto.HoldSeatRequest;
import com.example.cinema.repository.*;
import java.util.*;
@Service
public class HoldSeatService {

    private final BookingSeatRepository bookingRepo;
    private final RedisSeatService redisSeatService;
    private final SeatLockService seatLockService;


    public HoldSeatService(BookingSeatRepository bookingRepo,
                           RedisSeatService redisSeatService,
                           SeatLockService seatLockService) {
        this.bookingRepo = bookingRepo;
        this.redisSeatService = redisSeatService;
        this.seatLockService = seatLockService;
    }

    public void processHoldAction(Long showtimeId,Long accountId ,List<String> seats, String action, String sessionId) {
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

            // First try to create durable DB locks to prevent races
            try {
                seatLockService.tryLockByCodes(showtimeId, seatCodes, accountId, sessionId, 300);
            } catch (RuntimeException ex) {
                throw new RuntimeException("Không thể giữ ghế (DB): " + ex.getMessage());
            }

            // Then add redis soft-hold; if it fails, rollback DB locks
            try {
                redisSeatService.holdForUser(showtimeId, accountId, seatCodes);
            } catch (RuntimeException ex) {
                // rollback db locks
                try {
                    seatLockService.releaseByCodes(showtimeId, seatCodes);
                } catch (Exception ignore) {}
                throw new RuntimeException("Không thể giữ ghế (cache): " + ex.getMessage());
            }
        }
        else if ("release".equalsIgnoreCase(action)) {
            // Trả ghế lại cho user hiện tại: delete DB locks then redis
            try {
                seatLockService.releaseByCodes(showtimeId, seatCodes);
            } catch (Exception ex) {
                // continue
            }
            redisSeatService.releaseForUser(showtimeId, accountId, seatCodes);
        }
        else {
            throw new RuntimeException("Action không hợp lệ. Chỉ dùng 'hold' hoặc 'release'.");
        }
    }
}

