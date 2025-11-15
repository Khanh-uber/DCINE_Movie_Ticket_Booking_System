package com.example.cinema.dto;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

public class LocationDTO {
    private Long locationId;
    private String city_name;

    @Column(name="province_id")
    private Long province_id;

    
    
    

    public Long getLocationId() { return locationId; }
    public void setLocationId(Long locationId) { this.locationId = locationId; }

    public String getCity() { return city_name; }
    public void setCity(String city) { this.city_name = city; }

    public Long getProvinceId(){return province_id;}
    public void setProvinceId(Long provinceId){this.province_id = provinceId;}
}
