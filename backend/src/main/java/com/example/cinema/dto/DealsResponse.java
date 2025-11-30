package com.example.cinema.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DealsResponse {

    private String id;                 // của FE
    private String code;               // mã khuyến mãi
    private String title;              // title cho promo card
    private String description;        // mô tả
    private String type;               // PERCENT | AMOUNT
    private Double value;              // giá trị
    private Double minOrder;           // đơn tối thiểu
    private String membershipTierName; // hạng áp dụng
    private String endAt;              // yyyy-MM-dd
}

