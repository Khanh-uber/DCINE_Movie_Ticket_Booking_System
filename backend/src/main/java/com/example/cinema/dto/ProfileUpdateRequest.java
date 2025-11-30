package com.example.cinema.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateRequest {
    private String fullName;
    private String phone;
    private String dob;      // FE gửi string -> BE convert sang LocalDate
    private String gender;   // MALE / FEMALE / OTHER
    private String address;
    
}
