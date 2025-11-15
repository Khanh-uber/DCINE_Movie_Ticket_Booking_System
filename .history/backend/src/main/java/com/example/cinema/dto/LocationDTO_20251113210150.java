package com.example.cinema.dto;


public class LocationDTO {
    private Long locationId;
    private String city_name;
    private Long province_id;

    public LocationDTO(){}
    public LocationDTO(Long locationId, String city_name, Long provinceId){
        this.locationId = locationId;
        this.city_name = 
    }
    
    
    

    public Long getLocationId() { return locationId; }
    public void setLocationId(Long locationId) { this.locationId = locationId; }

    public String getCity() { return city_name; }
    public void setCity(String city) { this.city_name = city; }

    public Long getProvinceId(){return province_id;}
    public void setProvinceId(Long provinceId){this.province_id = provinceId;}
}
