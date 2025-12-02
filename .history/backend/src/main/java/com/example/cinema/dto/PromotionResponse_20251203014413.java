package com.example.cinema.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromotionResponse {
    private Long id;
    private String code;
    @JsonProperty("title")
    private String name;
    private String description;
    @JsonProperty("type")
    private String discountType;
    @JsonProperty("value")
    private Double discountValue;
    private Double minOrder;
    private Double maxDiscount;
    @JsonProperty("membershipTierName")
    private String appliesTo;
    @JsonProperty("active")
    private boolean isActive;
    private LocalDateTime validFrom;
    @JsonProperty("validUntil")
    private LocalDateTime validTo;
    private Long discountAmount;
}