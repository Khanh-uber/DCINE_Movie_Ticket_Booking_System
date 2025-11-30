package com.example.cinema.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "membership_tier")

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Membership {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tier_id")   
    private Long tierId;
    private String name;

    private String description;

    @Column(name = "min_spending")
    private Double minSpending;

    @Column(name = "discount_percent")
    private Double discountPercent;

    @Column(name = "point_multiplier")
    private Double pointMultiplier;

    @Column(name = "last_update")
    private LocalDateTime lastUpdate;
    
}
