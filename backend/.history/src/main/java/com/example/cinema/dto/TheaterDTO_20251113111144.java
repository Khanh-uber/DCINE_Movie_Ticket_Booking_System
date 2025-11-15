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
        dto.setId(theater.getTheaterId());
        dto.setName(theater.getName());
        dto.setName(theater.getLocation() != null ? theater.getLocation().getCity() : null);

        return dto;
    }
    // Getters / Setters
    public Long getId() { return id; }
    public void setId(Long theaterId) { this.id = theaterId; }

    public String getName() { return name; }
    public void setName(String name) { this.name  = name; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    
}
