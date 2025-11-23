package com.example.cinema.dto;
import java.util.*;
public class PricingRequest {
    public static class SeatSelect {
        private String code;
        private String type;
        public SeatSelect(){}
        public SeatSelect(String code, String type){
            this.code = code;
            this.type = type ;
        }
        public String getCode() {
            return code;
        }

        public void setCode(String code) {
            this.code = code;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }
    }

    private List<SeatSelect> seats;
    public PricingRequest(){}
    public List<SeatSelect> getSeats() {
        return seats;
    }

    public void setSeats(List<SeatSelect> seats) {
        this.seats = seats;
    }
}
