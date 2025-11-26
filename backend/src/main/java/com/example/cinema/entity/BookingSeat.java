package com.example.cinema.entity;
import jakarta.annotation.Generated;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.*;


@Entity
@Table(name="booking_seat")
public class BookingSeat {
    @EmbeddedId
    private BookingSeatKey id;

    @Column(name = "price_at_booking", nullable = false)
    private Long priceAtBooking;

    public BookingSeat() {}

    public BookingSeat(BookingSeatKey id, Long priceAtBooking) {
        this.id = id;
        this.priceAtBooking = priceAtBooking;
    }

    public BookingSeatKey getId() { return id; }
    public void setId(BookingSeatKey id) { this.id = id; }

    public Long getPriceAtBooking() { return priceAtBooking; }
    public void setPriceAtBooking(Long priceAtBooking) {
        this.priceAtBooking = priceAtBooking;
    }
}
