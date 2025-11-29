package com.example.cinema.dto;

import lombok.Data;

@Data
public class ProfileResponse {
    private UserResponse user;
    private List<MembershipTierDto> tiers;
    
}
