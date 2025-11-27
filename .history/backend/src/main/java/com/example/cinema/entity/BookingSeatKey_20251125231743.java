package com.example.cinema.entity;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class BookingSeatKey implements Serializable{
    @Column(name="booking_id")
    private Long bookingId;

    @Column(name="seat_id")
    private Long seatId;

    public BookingSeatKey(){}
    public BookingSeatKey(Long bookingId, Long seatId) {
        this.bookingId = bookingId;
        this.seatId = seatId;
    }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public Long getSeatId() { return seatId; }
    public void setSeatId(Long seatId) { this.seatId = seatId; }

}
