package com.example.cinema.dto;
import java.util.*;

public class PricingResponse {

    private List<PricingItem> items;
    private int totalAmount;

    public PricingResponse() {}

    public PricingResponse(List<PricingItem> items, int totalAmount) {
        this.items = items;
        this.totalAmount = totalAmount;
    }

    public List<PricingItem> getItems() {
        return items;
    }

    public void setItems(List<PricingItem> items) {
        this.items = items;
    }

    public int getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(int totalAmount) {
        this.totalAmount = totalAmount;
    }

    public static class PricingItem {
        private String code;
        private String zone;
        private String type;
        private int price;

        public PricingItem(){}
        public PricingItem(String code, String zone, String type, int price) {
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

        public int getPrice() {
            return price;
        }

        public void setPrice(int price) {
            this.price = price;
        }
    }
}
