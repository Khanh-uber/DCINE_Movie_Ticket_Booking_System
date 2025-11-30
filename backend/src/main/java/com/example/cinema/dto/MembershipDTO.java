package com.example.cinema.dto;

import lombok.Data; 

@Data
public class MembershipDTO {
    private Long id;
    private String name;         
    private String description;   
    private Double minSpent;      
    private Double pointRate;
}