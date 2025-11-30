package com.example.cinema.dto;
import java.util.*;

import lombok.Data;


public class HoldSeatRequest {
    private List<String> seats;
    private String action; // "hold" hoặc "release"

    public HoldSeatRequest(){}
    public HoldSeatRequest(List<String> seats, String action){
        this.seats = seats;
        this.action = action;
    }
    public List<SeatItem> getSeats() { return seats; }
    public void setSeats(List<SeatItem> seats) { this.seats = seats; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

}
