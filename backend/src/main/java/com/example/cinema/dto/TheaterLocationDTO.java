package com.example.cinema.dto;

public class TheaterLocationDTO {
    private Long id; // theater_id
    private String name; // theater_name
    private Long locationId; // location_id (trung gian, có thể bỏ nếu không cần)

    public TheaterLocationDTO() {}

    public TheaterLocationDTO(Long id, String name, Long locationId) {
        this.id = id;
        this.name = name;
        this.locationId = locationId;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Long getLocationId() { return locationId; }
    public void setLocationId(Long locationId) { this.locationId = locationId; }
}