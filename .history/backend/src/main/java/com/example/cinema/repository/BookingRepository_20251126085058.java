package com.example.cinema.repository;

import com.example.cinema.entity.*;

import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface BookingRepository extends JpaRepository<Booking, Long>{ 
    
    @Query(value = "SELECT * FROM booking " +
              "WHERE account_id = :accountId AND status = 'pending' " +
              "ORDER BY booking_id DESC " +
              "LIMIT 1",
      nativeQuery = true)
    Booking findByAccountId(Long accountId, String status);
}
