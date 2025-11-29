package com.example.cinema.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "membership")

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
