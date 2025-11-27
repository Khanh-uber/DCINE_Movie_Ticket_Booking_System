package com.example.cinema.repository;

import com.example.cinema.entity.*;

import jakarta.transaction.Transactional;

import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface BookingConcessionRepository extends JpaRepository<BookingConcession, BookingConcessionKey>{ 
    
    // (ConcessionService)
    @Modifying
    @Transactional
    @Query("DELETE FROM BookingConcession bc WHERE bc.bookingId = :bookingId")
    void deleteByBookingId(Long bookingId);
    
    @Modifying
    @Transactional
    @Query(value = """
        INSERT INTO booking_concession
        (booking_id, item_id, variant, quantity, unit_price, total_price)
        VALUES (:bookingId, :itemId, :variant, :qty, :unitPrice, :lineTotal)
        """, nativeQuery = true)
    void insertItem(Long bookingId,
                    Long itemId,
                    String variant,
                    Integer qty,
                    Long unitPrice,
                    Long lineTotal);


}
