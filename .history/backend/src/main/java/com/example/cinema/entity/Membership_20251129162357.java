package com.example.cinema.entity;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@E
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Membership {
    private Long tierId;
    private String name;
    private String description;
    private Double minSpending;
    private Double discountPercent;
    private Double pointMultiplier;
    private LocalDateTime lastUpdate;
    
}
