package com.example.cinema.entity;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Combo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @C
    private Long comboId;

    
}
