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

    public BookingConcession(Booking, 
                             int quantity, Double totalPrice) {
        this.quantity = quantity;
        this.totalPrice = totalPrice;
    }

    // =========================
    // GETTER - SETTER
    // =========================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
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
