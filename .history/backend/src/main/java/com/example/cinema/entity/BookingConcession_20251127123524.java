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

    @Column(name = "variant_id")
    private Long variantId;     // concession_variant.variant_id (có thể null)

    @Column(name = "quantity", nullable = false)
    private int quantity;

    @Column(name = "price", nullable = false)
    private Long price;         // lineTotal = unitPrice * quantity

    // =========================
    // Constructors
    // =========================

    public BookingConcession() {}

    public BookingConcession(Long bookingId, Long itemId, Long variantId,
                             int quantity, Long price) {
        this.bookingId = bookingId;
        this.itemId = itemId;
        this.variantId = variantId;
        this.quantity = quantity;
        this.price = price;
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

    public Long getVariantId() {
        return variantId;
    }

    public void setVariantId(Long variantId) {
        this.variantId = variantId;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public Long getPrice() {
        return price;
    }

    public void setPrice(Long price) {
        this.price = price;
    }
}
