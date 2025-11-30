package com.example.cinema.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@
public class ProfileUpdateRequest {
    private String fullName;
    private String phone;
    private String dob;      // FE gửi string -> BE convert sang LocalDate
    private String gender;   // MALE / FEMALE / OTHER
    private String address;
    
    public ProfileUpdateRequest(){}

    public ProfileUpdateRequest(){}

}
