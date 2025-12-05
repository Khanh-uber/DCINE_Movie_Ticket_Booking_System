package com.example.cinema.entity;


import jakarta.persistence.*;

import java.time.LocalDateTime;


@Entity
@Table(name = "showtime")
public class Showtime {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="showtime_id", nullable = false)
    private Long showtimeId;

    @Column(name="start_at")
    private LocalDateTime startAt;

    @Column(name="end_at")
    private LocalDateTime endAt;

    @Column(name ="base_price")
    private Double basePrice;
    

    public Long getShowtimeId(){return showtimeId;}
    
    public LocalDateTime getStartAt(){return startAt;}
    public void setStartAt(LocalDateTime startAt){this.startAt = startAt;}

    public LocalDateTime getEndAt(){return endAt;}
    public void setEndAt(){}






}
