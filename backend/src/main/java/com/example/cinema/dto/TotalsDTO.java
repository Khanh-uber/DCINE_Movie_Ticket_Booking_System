package com.example.cinema.dto;

import lombok.Data;

@Data
public class TotalsDTO {
    private Integer ticketAmount;
    private Integer combosAmount;
    private Integer subTotal;
    private Integer vat;
    private Integer discountAmount;
    private String discountCode;
    private Integer grandTotal;
}
