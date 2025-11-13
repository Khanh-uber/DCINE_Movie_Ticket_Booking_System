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
    
}
