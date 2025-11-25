package com.example.cinema.dto;
import java.util.*;
public class BookingRequest {
    private Long showtimeId;
    private List<Long> seatIds;

    public BookingRequest(){}
    public BookingRequest(Long accountId, Long showtimeId, List<Long> seatIds){
        this.accountId = accountId;
        this.showtimeId = showtimeId ;
        this.seatIds = seatIds;
    }
    
    public Long getAccountId(){
        return accountId;
    }
    public void setAccountId(Long accountId){
        this.accountId = accountId;
    }
    public Long getShowtimeId(){return showtimeId;}
    public void setShowtimeId(Long showtimeId){this.showtimeId = showtimeId;}
    
    public List<Long> getSeatIds(){return seatIds;}
    public void setSeatIds(List<Long> seatIds){this.seatIds = seatIds;}

    
    

}
