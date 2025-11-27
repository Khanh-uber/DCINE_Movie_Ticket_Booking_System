package com.example.cinema.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "booking_concession")
public class BookingConcession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")       // PK của bảng
    private Long id;

    @Column(name = "booking_id", nullable = false)
    private Long bookingId;

    @Column(name = "item_id", nullable = false)
    private Long itemId;        // concession_item.item_id

    @Column(name = "quantity", nullable = false)
    private int quantity;

    @Column(name = "total_price", nullable = false)
    private Double  totalPrice;         // lineTotal = unitPrice * quantity

    // =========================
    // Constructors
    // =========================

    public BookingConcession() {}

    public BookingConcession(Long bookingId, Long itemId, 
                             int quantity, Double totalPrice) {
        this.bookingId = bookingId;
        this.itemId = itemId;
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
        return price;
    }

    public void setPrice(Long price) {
        this.price = price;
    }
}
