package com.example.cinema.dto;
import qw
public class SeatMapResponseDTO {
    public class SeatMapResponse {
    private Long showtimeId;
    private Long hallId;
    private String hallName;

    private LayoutDTO layout;
    private List<SeatDTO> seats;

    private List<String> booked;
    private List<String> pending;
}
}
