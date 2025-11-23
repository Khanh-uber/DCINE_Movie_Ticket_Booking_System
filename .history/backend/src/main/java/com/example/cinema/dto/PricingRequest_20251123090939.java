package com.example.cinema.dto;

public class PricingRequest {
    public static class SeatSelect {
        private String code;
        private String type;
        public SeatSelect(){}
        public SeatSelect(String code, String type){
            this.code = code;
            this.type = type ;
        }
    }
}
