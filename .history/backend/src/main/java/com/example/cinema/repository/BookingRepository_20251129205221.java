package com.example.cinema.repository;

import com.example.cinema.entity.*;

import jakarta.transaction.Transactional;

import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface BookingRepository extends JpaRepository<Booking, Long>{ 
    
    // (BookingService)
    @Query(value = "SELECT * FROM booking " +
              "WHERE account_id = :accountId AND status = 'PENDING' " +
              "ORDER BY booking_id DESC " +
              "LIMIT 1",
      nativeQuery = true)
    Booking findLatestPending(@Param("accountId") Long accountId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM booking WHERE booking_id = :bookingId AND status = 'PENDING'", nativeQuery = true)
    void deleteBookingById(@Param("bookingId") Long bookingId);


    // (ConcessionService)
    @Query(value="""
        select *
        from booking
        where account_id = :accountId
        """, nativeQuery = true)
    Booking findPendingBookingByAccountId(@Param("accountId") Long accountId);

    //Profile service
    @Query(value = """
            SELECT COALESCE(SUM(total_amount), 0)
            FROM booking
            WHERE account_id = :accountId
            AND status = 'PAID'
        """, nativeQuery = true)
    Long getTotalSpent(@Param("accountId") Long accountId);


}
