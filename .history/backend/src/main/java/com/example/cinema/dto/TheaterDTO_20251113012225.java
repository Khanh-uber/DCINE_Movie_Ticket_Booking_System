package com.example.cinema.dto;

import com.example.cinema.entity.Theater;

public class TheaterDTO {

    private Long theaterId;
    private String theaterName;
    private String city;
    
    public TheaterDTO(){}

    public TheaterDTO(Long theaterId, String name, String city){
        this.theaterId = theaterId;
        this.theaterName = name;
        this.city = city;
    }
    public static TheaterDTO fromEntity(Theater theater){
        if (theater == null) return null;
        TheaterDTO dto = new TheaterDTO();
        dto.setTheaterId(theater.getTheaterId());
        dto.setCity(theater.getName());
        dto.setName(theater.);
    }
    // Getters / Setters
    public Long getTheaterId() { return theaterId; }
    public void setTheaterId(Long theaterId) { this.theaterId = theaterId; }

    public String getName() { return theaterName; }
    public void setName(String name) { this.theaterName = name; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    
}
