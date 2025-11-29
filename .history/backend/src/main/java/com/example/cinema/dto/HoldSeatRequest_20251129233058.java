package com.example.cinema.dto;
import java.util.*;

import lombok.Data;

@Data
public class HoldSeatRequest {
    private List<SeatItem> seats;
    private String action; // "hold" hoặc "release"

    public HoldSeatRequest(){}
    public HoldSeatRequest(List<SeatItem> seats, String action){
        this.seats = seats;
        this.action = action;
    }
    public List<SeatItem> getSeats() { return seats; }
    public void setSeats(List<String> seats) { this.seats = seats; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public static class SeatItem {
        private String code;
        private String type; // adult | child
        public SeatItem(){}
        public SeatItem()
    }
}
