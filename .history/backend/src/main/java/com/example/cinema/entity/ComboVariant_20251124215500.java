package com.example.cinema.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name="combo_variant")
public class ComboVariant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "variant_id")
    private Long variantId;

    @Column(name = "combo_id")
    private Long comboId;

    private String label;
    private String value;

    @Column(name = "price_diff")
    private Double priceDiff;

    public ComboVariant(){}
    
}
