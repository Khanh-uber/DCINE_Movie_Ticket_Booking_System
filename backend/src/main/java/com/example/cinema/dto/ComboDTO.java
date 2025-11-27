package com.example.cinema.dto;

import lombok.Data;

@Data
public class ComboDTO {
    private Long id;
    private String title;
    private Integer qty;
    private Integer unitPrice;
    private Integer lineTotal;
}
