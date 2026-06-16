package com.example.cinema.dto;

import java.util.List;

public class LockSeatRequest {
    private List<String> seats;

    public LockSeatRequest() {}

    public LockSeatRequest(List<String> seats) { this.seats = seats; }

    public List<String> getSeats() { return seats; }
    public void setSeats(List<String> seats) { this.seats = seats; }
}
