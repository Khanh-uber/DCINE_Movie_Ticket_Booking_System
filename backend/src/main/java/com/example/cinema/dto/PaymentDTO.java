package com.example.cinema.dto;

import lombok.Data;

@Data
public class PaymentDTO {
    private String orderId;
    private String transactionId;
    private String status;          // pending | paid
    private Integer amount;
    private String paymentMethod;
    private String createdAt;
}
