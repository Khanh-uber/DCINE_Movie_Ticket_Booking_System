package com.example.cinema.dto;
import java.util.*;
public class SeatMapResponse {
    
    private Long showtimeId;
    private Long hallId;
    private String hallName;

    private LayoutDTO layout;
    
    private List<SeatDTO> seats;

    private List<String> booked;
    private List<String> pending;

    private Map<String, PricingDTO> pricing;

    public SeatMapResponse() {}
    public SeatMapResponse(Long showtimeId, Long hallId, String hallName, LayoutDTO layout,List<SeatDTO> seats, List<String> booked, List<String> pending){
        this.showtimeId = showtimeId;
        this.hallId = hallId;
        this.hallName = hallName;
        this.layout = layout; 
        this.seats = seats;
        this.booked = booked ;
        this.pending = pending;
    }
    public Long getShowtimeId() {
        return showtimeId;
    }

    public void setShowtimeId(Long showtimeId) {
        this.showtimeId = showtimeId;
    }

    public Long getHallId() {
        return hallId;
    }

    public void setHallId(Long hallId) {
        this.hallId = hallId;
    }

    public String getHallName() {
        return hallName;
    }

    public void setHallName(String hallName) {
        this.hallName = hallName;
    }

    public LayoutDTO getLayout() {
        return layout;
    }

    public void setLayout(LayoutDTO layout) {
        this.layout = layout;
    }

    public List<SeatDTO> getSeats() {
        return seats;
    }

    public void setSeats(List<SeatDTO> seats) {
        this.seats = seats;
    }

    public List<String> getBooked() {
        return booked;
    }

    public void setBooked(List<String> booked) {
        this.booked = booked;
    }

    public List<String> getPending() {
        return pending;
    }

    public void setPending(List<String> pending) {
        this.pending = pending;
    }

    public Map<String, PricingDTO> getPricing(){return pricing;}
    public void setPricing(Map<String, PricingDTO> ){}
}
