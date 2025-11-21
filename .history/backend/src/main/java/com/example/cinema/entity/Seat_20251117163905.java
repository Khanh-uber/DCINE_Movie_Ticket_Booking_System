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

    @Co
}
