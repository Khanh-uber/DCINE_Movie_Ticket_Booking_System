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

    // (ConcessionService)
    @Query(value="""
        SELECT *
        FROM booking
        WHERE account_id = :accountId
        AND status = 'PENDING'
        ORDER BY booking_id DESC
        LIMIT 1""", nativeQuery = true)
    Booking getPendingBooking(@Param("accountId") Long accountId);



    @Modifying
    @Query(value = "DELETE FROM booking WHERE booking_id = :bookingId AND status = 'PENDING'", nativeQuery = true)
    void deletePendingBookingById(@Param("bookingId") Long bookingId);


    @Query(value="""
            select * from booking
            where account_id = :accountId and status = 'PENDING'
            """, nativeQuery = true)
    List<Booking> findAllPendingByAccountId(@Param("accountId") Long accountId);


    //Profile service
    @Query(value = """
            SELECT COALESCE(SUM(total_amount), 0)
            FROM booking
            WHERE account_id = :accountId
            AND status = 'PAID'
        """, nativeQuery = true)
    Long getTotalSpent(@Param("accountId") Long accountId);

    
    List<Map<String, Object>> findPaidBookingSummary(@Param("accountId") Long accountId);

    
    


}
