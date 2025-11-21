package com.example.cinema.dto;
import java.util.*;
public class BookingResponse {
    private Long bookingId;
    private Double totalAmount;
    private String status;
    private List<String> seats;

    public BookingResponse(){}
    public BookingResponse(Long bookingId, Double totalAmount, String status){
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
