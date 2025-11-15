package com.example.cinema.entity;
import jakarta.persistence.*;
import java.util.*;

import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "location")
public class Location {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long locationId;

    @JsonProperty("city_name")
    @Column(name = "city_name")   // bắt buộc nếu muốn JSON snake_case
    private String cityName;

    @Column(name="province_id")
    private Long provinceId;

    
    
    

    public Long getLocationId() { return locationId; }
    public void setLocationId(Long locationId) { this.locationId = locationId; }

    public String getCity() { return cityName; }
    public void setCity(String city) { this.cityName = city; }

    public Long getProvinceId(){return provinceId;}
    public void setProvinceId(Long provinceId){this.provinceId = provinceId;}
}
