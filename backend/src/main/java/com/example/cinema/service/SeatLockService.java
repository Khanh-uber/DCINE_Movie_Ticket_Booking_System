package com.example.cinema.service;

import com.example.cinema.entity.Seat;
import com.example.cinema.entity.SeatLock;
import com.example.cinema.repository.SeatLockRepository;
import com.example.cinema.repository.SeatRepository;
import com.example.cinema.repository.ShowTimeRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class SeatLockService {

    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_PAID = "PAID";
    private static final String STATUS_EXPIRED = "EXPIRED";

    private final SeatLockRepository seatLockRepository;
    private final SeatRepository seatRepository;
    private final ShowTimeRepository showTimeRepository;

    public SeatLockService(SeatLockRepository seatLockRepository, SeatRepository seatRepository, ShowTimeRepository showTimeRepository) {
        this.seatLockRepository = seatLockRepository;
        this.seatRepository = seatRepository;
        this.showTimeRepository = showTimeRepository;
    }

    @Transactional
    public List<String> tryLockByCodes(Long showtimeId, List<String> seatCodes, Long accountId, String sessionId, int ttlSeconds) {
        if (seatCodes == null || seatCodes.isEmpty()) return List.of();

        Long hallId = showTimeRepository.findHallId(showtimeId);
        if (hallId == null) throw new RuntimeException("Showtime not found");

        List<Seat> seats = seatRepository.findSeatsByHallAndCodes(hallId, seatCodes);
        Map<String, Seat> codeToSeat = new HashMap<>();
        for (Seat s : seats) {
            String code = s.getRowLabel() + s.getSeatNumber();
            codeToSeat.put(code, s);
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusSeconds(ttlSeconds);

        List<SeatLock> toSave = new ArrayList<>();
        for (String code : seatCodes) {
            Seat s = codeToSeat.get(code);
            if (s == null) throw new RuntimeException("Seat code not found: " + code);

            Optional<SeatLock> existing = seatLockRepository.findByShowtimeIdAndSeatId(showtimeId, s.getSeatId());
            SeatLock sl;
            if (existing.isPresent()) {
                sl = existing.get();

                boolean active = sl.getExpiresAt() != null && sl.getExpiresAt().isAfter(now);
                boolean sameOwner = Objects.equals(sl.getAccountId(), accountId) && sl.getBookingId() == null;

                if (STATUS_PAID.equals(sl.getStatus())) {
                    throw new RuntimeException("Seat " + code + " is already paid");
                }

                if (active && !STATUS_EXPIRED.equals(sl.getStatus()) && !sameOwner) {
                    throw new RuntimeException("Seat " + code + " is locked");
                }
            } else {
                sl = new SeatLock();
            }

            sl.setShowtimeId(showtimeId);
            sl.setSeatId(s.getSeatId());
            sl.setBookingId(null);
            sl.setAccountId(accountId);
            sl.setSessionId(sessionId);
            sl.setStatus(STATUS_PENDING);
            sl.setLockedAt(now);
            sl.setPaidAt(null);
            sl.setExpiresAt(expiresAt);
            toSave.add(sl);
        }

        try {
            seatLockRepository.saveAll(toSave);
        } catch (DataIntegrityViolationException ex) {
            throw new RuntimeException("One or more seats are already locked");
        }

        return seatCodes;
    }

    @Transactional
    public void releaseByCodes(Long showtimeId, List<String> seatCodes) {
        if (seatCodes == null || seatCodes.isEmpty()) return;

        Long hallId = showTimeRepository.findHallId(showtimeId);
        if (hallId == null) return;

        LocalDateTime now = LocalDateTime.now();
        List<Seat> seats = seatRepository.findSeatsByHallAndCodes(hallId, seatCodes);
        for (Seat s : seats) {
            seatLockRepository.findByShowtimeIdAndSeatId(showtimeId, s.getSeatId())
                    .filter(lock -> !STATUS_PAID.equals(lock.getStatus()) && lock.getBookingId() == null)
                    .ifPresent(lock -> {
                        lock.setStatus(STATUS_EXPIRED);
                        lock.setExpiresAt(now);
                        seatLockRepository.save(lock);
                    });
        }
    }

    @Transactional
    public void clearLocksForAccount(Long showtimeId, Long accountId) {
        LocalDateTime now = LocalDateTime.now();
        List<SeatLock> locks = seatLockRepository.findByShowtimeIdAndAccountIdAndStatus(showtimeId, accountId, STATUS_PENDING);
        for (SeatLock lock : locks) {
            if (lock.getBookingId() != null) {
                continue;
            }
            lock.setStatus(STATUS_EXPIRED);
            lock.setExpiresAt(now);
            seatLockRepository.save(lock);
        }
    }

    @Transactional
    public void promoteHeldLocksToPendingBooking(Long showtimeId, Long accountId, Long bookingId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusMinutes(30);

        List<SeatLock> locks = seatLockRepository.findByShowtimeIdAndAccountIdAndStatus(showtimeId, accountId, STATUS_PENDING);
        for (SeatLock lock : locks) {
            if (lock.getExpiresAt() != null && lock.getExpiresAt().isBefore(now)) {
                continue;
            }
            lock.setBookingId(bookingId);
            lock.setStatus(STATUS_PENDING);
            lock.setExpiresAt(expiresAt);
            seatLockRepository.save(lock);
        }
    }

    @Transactional
    public void markPaidByBookingId(Long bookingId) {
        if (bookingId == null) return;

        LocalDateTime now = LocalDateTime.now();
        List<SeatLock> locks = seatLockRepository.findByBookingId(bookingId);
        for (SeatLock lock : locks) {
            lock.setStatus(STATUS_PAID);
            lock.setPaidAt(now);
            lock.setExpiresAt(now.plusDays(3650));
            seatLockRepository.save(lock);
        }
    }
}
