package com.example.cinema.entity;

import jakarta.annotation.Generated;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;

@Entity
public class Combo {
    @GeneratedValue
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="combo_id")
    private Long comboId;

    
}
