package com.example.cinema.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "membership_tier")

public class Membership{
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
    
    public Membership(){}  
    public Membership(Long tierId, String name, String description, Double minSpending, Double discountPercent, Double pointMultiplier, LocalDateTime lastUpdate){
        this.tierId = tierId;
        this.name = name;
        this.description = description;
        this.minSpending = minSpending;
        this.discountPercent = discountPercent;
        this.pointMultiplier = pointMultiplier;
        this.lastUpdate = lastUpdate;
    }
    public Long getTierId(){
        return tierId;
    }
    public void setTierId(Long tierId){
        this.tierId = tierId;
    }
    public String getName(){
        return name;
    }
    public void setName(String name){
        this.name = name;
    }
    public String getDescription(){
        return description;
    }
    public void setDescription(String description){
        this.description = description;
    }
    public Double getMinSpending(){
        return minSpending;
    }
    public void setMinSpending(Double minSpending){
        this.minSpending = minSpending;
    }
    public Double getDiscountPercent(){
        return discountPercent;
    }
    public void setDiscountPercent(Double discountPercent){
        this.discountPercent = discountPercent;
    }
    public Double getPointMultiplier(){
        return pointMultiplier;
    }
    public void setPointMultiplier(Double pointMultiplier){
        this.pointMultiplier = pointMultiplier;
    }
    public LocalDateTime getLastUpdate(){
        return lastUpdate;
    }
    public void setLastUpdate(LocalDateTime lastUpdate){
        this.lastUpdate = lastUpdate;
    }
}
