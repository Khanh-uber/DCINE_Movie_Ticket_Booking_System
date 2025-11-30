package com.example.cinema.dto;
import java.util.*;
public class BookingRequest {
    private Long showtimeId;

    private List<SeatRequest> seats;

    public BookingRequest(){}
    public Long getShowtimeId() { return showtimeId; }
    public void setShowtimeId(Long showtimeId) { this.showtimeId = showtimeId; }

    public List<SeatRequest> getSeats() { return seats; }
    public void setSeats(List<SeatRequest> seats) { this.seats = seats; }

    public static class SeatRequest {   
        private String code;  // A1, A2...
        private String type;  // adult | child

        public SeatRequest(){}
        
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
    }
}

