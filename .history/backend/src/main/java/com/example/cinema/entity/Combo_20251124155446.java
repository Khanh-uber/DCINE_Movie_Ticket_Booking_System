package com.example.cinema.entity;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Combo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="combo_id")
    private Long comboId;


    private String code;

    private String title ;

    private String description;

    private Double price;

    @Column(name="old_price")
    private Double old_price;
    
    private String tag;

    private String combo_url;

    private boolean active;
}
