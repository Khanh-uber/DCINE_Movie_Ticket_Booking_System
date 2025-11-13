package com.example.cinema.dto;

import com.example.cinema.entity.Theater;

public class TheaterDTO {

    private Long id;
    private String name;
    private String city;
    
    public TheaterDTO(){}

    public TheaterDTO(Long theaterId, String name, String city){
        this.id = theaterId;
        this.name = name;
        this.city = city;
    }
    public static TheaterDTO fromEntity(Theater theater){
        if (theater == null) return null;
        TheaterDTO dto = new TheaterDTO();
        dto.setTheaterId(theater.getTheaterId());
        dto.setCity(theater.getName());
        dto.setName(theater.getLocation() != null ? theater.getLocation().getCity() : null);

        return dto;
    }
    // Getters / Setters
    public Long getTheaterId() { return id; }
    public void setTheaterId(Long theaterId) { this.theaterId = theaterId; }

    public String getName() { return bame; }
    public void setName(String name) { this.theaterName = name; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    
}
