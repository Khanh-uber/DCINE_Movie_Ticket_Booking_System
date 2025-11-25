package com.example.cinema.dto;
import java.util.*;
public class BookingResponse {
    private Long bookingId;
    private String status;
    private List<Item> items;
    private Long totalAmount;
    public BookingResponse(){}
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

        public Item (){}
        public Item(String code, String zone, String type, Long price) {
            this.code = code;
            this.zone = zone;
            this.type = type;
            this.price = price;
    
        }
        public String getCode() {
            return code;
        }

        public void setCode(String code) {
            this.code = code;
        }

        public String getZone() {
            return zone;
        }

        public void setZone(String zone) {
            this.zone = zone;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public Long getPrice() {
            return price;
        }

        public void setPrice(Long price) {
            this.price = price;
        }
    }
}
