package com.example.cinema.entity;


import jakarta.annotation.Generated;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.*;
public class Seat {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="seat_id", nullable = false)
    private Long seatId;

    @Column(name="hall_id", nullable = false)
    private Long hallId;

    @Column(name="row_label", nullable = false)
    private String rowLabel;

    @Column(name="seat_number", nullable = false)
    private int seatNumber;

    @Column(name="seat_type_id", nullable = false)
    private Long seatTypeId;

    public Seat(){}

    public Long getSeatId(){return seatId;}
    public void set

}
