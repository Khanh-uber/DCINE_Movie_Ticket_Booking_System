package com.example.cinema.entity;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class BookingConcessionKey implements Serializable {

    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "item_id")
    private Long itemId;


    public BookingConcessionKey() {}

    public BookingConcessionKey(Long bookingId, Long itemId ) {
        this.bookingId = bookingId;
        this.itemId = itemId;
    }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }


    // RẤT QUAN TRỌNG: equals + hashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof BookingConcessionKey)) return false;
        BookingConcessionKey key = (BookingConcessionKey) o;
        return Objects.equals(bookingId, key.bookingId) &&
               Objects.equals(itemId, key.itemId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(bookingId, itemId);
    }
}

