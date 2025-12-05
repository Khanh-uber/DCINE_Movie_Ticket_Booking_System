package com.example.cinema.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "booking_voucher")
public class BookingVoucher {

    @EmbeddedId
    private BookingVoucherId id;

    @Column(name = "discount_applied")
    private Long discountApplied;

    public BookingVoucher() {}

    public BookingVoucher(BookingVoucherId id, Long discountApplied) {
        this.id = id;
        this.discountApplied = discountApplied;
    }

    public BookingVoucherId getId() {
        return id;
    }

    public void setId(BookingVoucherId id) {
        this.id = id;
    }

    public Long getDiscountApplied() {
        return discountApplied;
    }

    public void setDiscountApplied(Long discountApplied) {
        this.discountApplied = discountApplied;
    }
}
