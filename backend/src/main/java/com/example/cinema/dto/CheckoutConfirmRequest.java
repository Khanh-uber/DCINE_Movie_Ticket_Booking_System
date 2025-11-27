package com.example.cinema.dto;

import lombok.Data;

@Data
public class CheckoutConfirmRequest {
    private String paymentMethod;         // card | wallet | bank
    private OrderSummaryDTO order;
}
