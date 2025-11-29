package com.example.cinema.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromotionResponse {
    private Long id;
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

    
}
