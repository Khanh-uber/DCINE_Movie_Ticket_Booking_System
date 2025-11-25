package com.example.cinema.dto;
import java.util.*;
public class BookingResponse {
    private Long bookingId;
    private String status;
    private List<Item> items;
    private Long totalAmount;
    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<Item> getItems() {
        return items;
    }

    public void setItems(List<Item> items) {
        this.items = items;
    }

    public Long getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Long totalAmount) {
        this.totalAmount = totalAmount;
    }
    public static class Item {
        private String code;
        private String zone;
        private String type;  // adult | child
        private Long price;

        public Item(String code, String zone, String type, Long price) {
            this.code = code;
            this.zone = zone;
            this.type = type;
            this.price = price;
    
        }
    }
}
