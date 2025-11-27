package com.example.cinema.dto;

import java.util.*;
public class ConcessionCartRequest {
    private List<CartItem> items;
    public ConcessionCartRequest(){}
    public static class CartItem {
        private Long comboId;
        private String variant;
        private int qty;
        public CartItem(){}
        public Long getComboId() { return comboId; }
        public void setComboId(Long comboId) { this.comboId = comboId; }

        public String getVariant() { return variant; }
        public void setVariant(String variant) { this.variant = variant; }

        public int getQty() { return qty; }
        public void setQty(int qty) { this.qty = qty; }
    }

    public List<CartItem> getItems() { return items; }
    public void setItems(List<CartItem> items) { this.items = items; }
}
