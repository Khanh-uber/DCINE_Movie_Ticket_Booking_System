package com.example.cinema.repository;

import com.example.cinema.entity.SeatLock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SeatLockRepository extends JpaRepository<SeatLock, Long> {

    Optional<SeatLock> findByShowtimeIdAndSeatId(Long showtimeId, Long seatId);

    List<SeatLock> findByShowtimeIdAndAccountIdAndStatus(Long showtimeId, Long accountId, String status);

    List<SeatLock> findByBookingId(Long bookingId);

    @Query(value = "SELECT sl FROM SeatLock sl WHERE sl.showtimeId = :showtimeId AND sl.expiresAt > :now AND sl.status <> 'PAID'")
    List<SeatLock> findActiveByShowtime(@Param("showtimeId") Long showtimeId, @Param("now") LocalDateTime now);

    void deleteByShowtimeIdAndAccountId(Long showtimeId, Long accountId);

    void deleteByShowtimeIdAndSeatId(Long showtimeId, Long seatId);

    void deleteByShowtimeIdAndSeatIdAndStatus(Long showtimeId, Long seatId, String status);
}
