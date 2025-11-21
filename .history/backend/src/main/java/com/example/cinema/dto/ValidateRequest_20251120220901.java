package com.example.cinema.dto;

import java.util.*;
public class ValidateRequest {
    private Long showtimeId;
    private List<String> seats;

    public ValidateRequest(){}
    public ValidateRequest(Long showtimeId, List<String> seats){
        this.showtimeId = showtimeId;
        this.seats = seats;
    }
    
    public Long getShowtimeId(){return showtimeId;}
    public void setShowtimeId()

}
