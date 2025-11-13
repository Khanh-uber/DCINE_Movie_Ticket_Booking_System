package com.example.cinema.entity;
import jakarta.annotation.Generated;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.*;


@Entity
@Table(name = "theater")
public class Theater {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long theaterId;

    private String name;
    private String address;

    private Long locationId;
    public Theater(){}
    
    public String getName(){return name;}
    public void setName(String name){this.name = name;}

    public Long getLocationId(){return locationId;}
    public void setLocationId(Long locationId){this.locationId = locationId;}

    public String getAddress(){return this.address;}
    public void setAddress(String address){this.address = address;}
}
