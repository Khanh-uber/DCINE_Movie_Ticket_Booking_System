package com.example.cinema.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "booking_concession")
public class BookingConcession {
    @EmbeddedId
    private BookingConcessionKey id;

    @Column(name = "quantity", nullable = false)
    private int quantity;

    @Column(name = "total_price", nullable = false)
    private Double  totalPrice;         // lineTotal = unitPrice * quantity

    // =========================
    // Constructors
    // =========================

    public BookingConcession() {}

    public BookingConcession(BookingConcessionKey id, 
                             int quantity, Double totalPrice) {
        this.quantity = quantity;
        this.totalPrice = totalPrice;
        this.id = id;
    }

    // =========================
    // GETTER - SETTER
    // =========================

    public BookingConcessionKey getId() {
        return id;
    }

    public void setId(BookingConcessionKey id) {
        this.id = id;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public Double getTotalPrice() {
        return totalPrice;
    }

    public void setPrice(Double price) {
        this.totalPrice = price;
    }
}
