package com.example.cinema.dto;
import java.util.*;
public class SeatMapResponseDTO {
    
    private Long showtimeId;
    private Long hallId;
    private String hallName;

    private LayoutDTO layout;
    private List<SeatDTO> seats;

    private List<String> booked;
    private List<String> pending;

    public class SeatMapResponse {}
    public class SeatMapResponse(Long showtimeId, Long hallId, )
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
}
