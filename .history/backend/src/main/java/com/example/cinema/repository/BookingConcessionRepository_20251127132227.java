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
    
}
