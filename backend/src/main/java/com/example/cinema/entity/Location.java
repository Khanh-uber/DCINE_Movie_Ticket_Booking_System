package com.example.cinema.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "location")
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "location_id")
    @JsonProperty("id")  // FE cần field id
    private Long id;

    @Column(name = "city_name")
    @JsonProperty("city_name")
    private String cityName;

    @Column(name = "province_id")
    @JsonProperty("province_id")
    private Long provinceId;

    @Column(name = "name")
    @JsonProperty("name")   // FE gọi 'name'
    private String name;

    @Column(name = "address")
    @JsonProperty("address")  // FE hiển thị địa chỉ
    private String address;

    public Location() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCityName() { return cityName; }
    public void setCityName(String cityName) { this.cityName = cityName; }

    public Long getProvinceId() { return provinceId; }
    public void setProvinceId(Long provinceId) { this.provinceId = provinceId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}
