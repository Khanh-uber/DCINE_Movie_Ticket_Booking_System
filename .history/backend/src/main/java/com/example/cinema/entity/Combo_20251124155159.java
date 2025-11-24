package com.example.cinema.entity;

import jakarta.annotation.Generated;
import jakarta.persistence.Entity;

@Entity
public class Combo {
    @Generated
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="combo_id")
    private Long comboId;

    
}
