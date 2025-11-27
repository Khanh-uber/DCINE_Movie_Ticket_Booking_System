package com.example.cinema.dto;

public class LocationDTO {
    private Long id;            
    private String city_name;   
    private Long province_id;   
    private String name;        
    private String address;     

    public LocationDTO(Long id, String city_name, Long province_id, String name, String address) {
        this.id = id;
        this.city_name = city_name;
        this.province_id = province_id;
        this.name = name;
        this.address = address;
    }

    public Long getId() {
        return id;
    }

    public String getCity_name() {
        return city_name;
    }

    public Long getProvince_id() {
        return province_id;
    }

    public String getName() {
        return name;
    }

    public String getAddress() {
        return address;
    }
}
