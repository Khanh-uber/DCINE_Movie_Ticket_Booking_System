package com.example.cinema.dto;
import java.util.*;
public class BookingRequest {
    private Long accountId;
    private Long showtimeId;
    private List<Long> seatIds;

    public BookingRequest(){}
    public BookingRequest(Long accountId, Long showtimeId, List<Long> seatIds){
        this.accountId = accountId;
        this.showtimeId = showtimeId ;
        this.seatIds = seatIds;
    }
    
    public Long getAccountId(){
        return accountId;qư
    }
    

}
