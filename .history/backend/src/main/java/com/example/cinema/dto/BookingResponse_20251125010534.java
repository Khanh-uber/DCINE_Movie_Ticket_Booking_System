package com.example.cinema.dto;
import java.util.*;
public class BookingResponse {
    private Long bookingId;
    private String status;
    private List<Item> items;
    private Long totalAmount;

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
