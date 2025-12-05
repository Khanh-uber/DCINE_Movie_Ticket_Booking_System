package com.example.cinema.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class BookingVoucherId implements Serializable {

    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "voucher_id")
    private Long voucherId;

    public BookingVoucherId() {}

    public BookingVoucherId(Long bookingId, Long voucherId) {
        this.bookingId = bookingId;
        this.voucherId = voucherId;
    }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public Long getVoucherId() { return voucherId; }
    public void setVoucherId(Long voucherId) { this.voucherId = voucherId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof BookingVoucherId)) return false;
        BookingVoucherId that = (BookingVoucherId) o;
        return Objects.equals(bookingId, that.bookingId)
            && Objects.equals(voucherId, that.voucherId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(bookingId, voucherId);
    }
}
