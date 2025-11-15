package com.example.cinema.entity;
import jakarta.persistence.*;
import java.util.*;

@Entity
@Table(name = "location")
public class Location {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long location_id;

    @Column(name = "city_name", nullable = false)
    private String city_name;

    @Column(name="province_id")
    private Long province_id;

    
    
    

    public Long getLocationId() { return location_od; }
    public void setLocationId(Long locationId) { this.locationId = locationId; }

    public String getCity() { return city_name; }
    public void setCity(String city) { this.city_name = city; }

    public Long getProvinceId(){return province_id;}
    public void setProvinceId(Long provinceId){this.province_id = provinceId;}
}
