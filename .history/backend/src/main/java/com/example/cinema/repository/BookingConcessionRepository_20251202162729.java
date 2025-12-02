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
    @Query(value="DELETE FROM booking_concession bc WHERE bc.booking_id = :bookingId", nativeQuery =true)
    void deleteByBookingId(@Param("bookingId") Long bookingId);
    
    @Modifying
    @Transactional
    @Query(value = """
        INSERT INTO booking_concession
        (booking_id, item_id, quantity,total_price)
        VALUES (:bookingId, :itemId, :qty,  :totalPrice)
        """, nativeQuery = true)
    void insertItem(@Param("bookingId") Long bookingId,
                    @Param("itemId") Long itemId,
                    @Param("qty") Integer qty,
                    @Param("totalPrice") Double totalPrice);

    @Query(value = """
        SELECT 
            bc.item_id,
            bc.quantity,
            bc.total_price
        FROM booking_concession bc
        WHERE bc.booking_id = :bookingId
        """, nativeQuery = true)
    List<Map<String, Object>> findByBookingId(Long bookingId);

    @Query(value = """
            SELECT COALESCE(SUM(quantity * total_price), 0)
            FROM booking_concession
            WHERE booking_id = :bookingId
        """, nativeQuery = true)
    Long sumComboTotal(@Param("bookingId") Long bookingId);


    @Query(value="""
            select ci.title,
                    bc.quantity
            from concession_item ci
            join booking_concession bc on bc.item_id = ci.item_id 
            where bc.booking_id = :bookingId
            """, nativeQuery = true)
    List<Map<String, Object>> findConcession(@Param("bookingId") Long bookingId);

}
