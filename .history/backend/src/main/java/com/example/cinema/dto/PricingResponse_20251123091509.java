package com.example.cinema.dto;
import java.util.*;

import org.hibernate.cache.spi.support.AbstractReadWriteAccess.Item;
public class PricingResponse {

    private List<PricingItemDTO> items;
    private int totalAmount;

    public PricingPreviewResponse() {}

    public PricingPreviewResponse(List<PricingItemDTO> items, int totalAmount) {
        this.items = items;
        this.totalAmount = totalAmount;
    }

    public List<PricingItemDTO> getItems() {
        return items;
    }

    public void setItems(List<PricingItemDTO> items) {
        this.items = items;
    }

    public int getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(int totalAmount) {
        this.totalAmount = totalAmount;
    }

    public static class PricingItem()
}
