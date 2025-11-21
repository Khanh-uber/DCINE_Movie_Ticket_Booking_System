package com.example.cinema.entity;
import jakarta.annotation.Generated;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.*;
@Entity

public class SeatType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long seatTypeId;
    
    private String name;
    
    private Double priceMultiplier;

    public SeatType(){}

    public Long getSeatTypeId(){return seatTypeId ;}
    public void setSeatTypeId(Long seatTypeId){this.seatTypeId = seatTypeId;}
    
    public String getName(){return name;}
    public void setName(String name){this.name = name;}
    
    public Double getPriceMultiplier()
    
}
