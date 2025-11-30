package com.example.cinema.dto;
import java.util.*;

import lombok.Data;


public class HoldSeatRequest {
    private List<String> seats;
    private String action; // "hold" hoặc "release"

    public HoldSeatRequest(){}
    public HoldSeatRequest(List<SeatItem> seats, String action){
        this.seats = seats;
        this.action = action;
    }
    public List<SeatItem> getSeats() { return seats; }
    public void setSeats(List<SeatItem> seats) { this.seats = seats; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public static class SeatItem {
        private String code;
        private String type; // adult | child
        public SeatItem(){}
        public SeatItem(String code, String type){
            this.code = code;
            this.type = type;
        }
        public String getCode(){return code;}
        public void setCode(String code){this.code = code;}

        public String getType(){return type;}
        public void setType(String type){this.type = type;}
    }
}
