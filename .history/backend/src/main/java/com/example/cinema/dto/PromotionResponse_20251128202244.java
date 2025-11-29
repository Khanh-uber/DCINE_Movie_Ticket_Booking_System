package com.example.cinema.dto;

import java.time.LocalDateTime;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor

public class PromotionResponse {
    private String id;
    private String code;
    private String name;
    private String description;
    private String discountType;
    private Double discountValue;
    private Double minOrder;
    private Double maxDiscount;
    private String appliesTo;
    private boolean isActive;
    private LocalDateTime validFrom;
    private LocalDateTime validTo;
    
    public PromotionResponse (){}

    
}
