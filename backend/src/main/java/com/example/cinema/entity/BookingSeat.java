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
    
    @Column(name="price_at_booking", nullable = false)
    private Double priceAtBooking;

    public BookingSeat(){}
    public BookingSeat(Long seatId, Double priceAtBooking) {
        this.seatId = seatId;
        this.priceAtBooking = priceAtBooking;
    }
    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public Long getSeatId() {
        return seatId;
    }

    public void setSeatId(Long seatId) {
        this.seatId = seatId;
    }

    public Double getPriceAtBooking() {
        return priceAtBooking;
    }

    public void setPriceAtBooking(Double priceAtBooking) {
        this.priceAtBooking = priceAtBooking;
    }
}
