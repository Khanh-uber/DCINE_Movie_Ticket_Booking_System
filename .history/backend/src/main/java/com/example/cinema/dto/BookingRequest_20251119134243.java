package com.example.cinema.dto;

public class BookingRequest {
    private Long accountId;
    private Long showtimeId;
    private List<Long> seatIds;

    public BookingRequest(){}
    public BookingRequest(Long accountId, Long showtimeId, List<Long> seatIds){
        
    }

}
