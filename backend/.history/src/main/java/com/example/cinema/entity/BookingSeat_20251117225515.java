package com.example.cinema.entity;
import jakarta.annotation.Generated;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.*;

@Entity
public class BookingSeat {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="booking_id")
    private Long bookingId;
    
    @Column(name="seat_id", nullable = false)
    private Long seatId ;
    
    @Column(name="")
    private Double priceAtBooking;
}
