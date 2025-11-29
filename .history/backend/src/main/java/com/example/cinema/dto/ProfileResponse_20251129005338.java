package com.example.cinema.dto;

import java.util.List;

import lombok.Data;

@Data
public class ProfileResponse {
    private UserResponse user;
    private List<MembershipTierDto> tiers;
    public 
    public UserDTO getUser() { return user; }
    public void setUser(UserDTO user) { this.user = user; }

    public List<MembershipTierDTO> getTiers() { return tiers; }
    public void setTiers(List<MembershipTierDTO> tiers) { this.tiers = tiers; }
}
