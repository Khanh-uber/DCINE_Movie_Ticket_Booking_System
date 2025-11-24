package com.example.cinema.entity;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;

@Entity
public class Combo {
    @GeneratedValue(strategy = )
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="combo_id")
    private Long comboId;

    
}
