package com.example.cinema.entity;

import jakarta.persistence.Entity;

@Entity
public class Combo {
    
    @Id
    @@GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="customer_id")
}
