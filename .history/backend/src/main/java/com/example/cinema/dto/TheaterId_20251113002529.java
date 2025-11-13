package com.example.cinema.dto;

public class TheaterId {
    private Long theaterId;
    private String theaterName;
    private String city;
    
    public Theater(){}

    public Theater(Long theaterId, String name, String city){
        this.theaterId = theaterId;
        this.theaterName = name;
        this.city = city;
    }

    // Getters / Setters
    public Long getTheaterId() { return theaterId; }
    public void setTheaterId(Long theaterId) { this.theaterId = theaterId; }

    public String getName() { return theaterNameame; }
    public void setName(String name) { this.name = name; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    
}
