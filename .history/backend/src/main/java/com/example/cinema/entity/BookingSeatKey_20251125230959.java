package com.example.cinema.entity;

import java.io.Serializable;

public class BookingSeatKey implements Serializable{
    @Column(name="booking_id")
    private Long bookingId;
    
}
