package com.example.cinema.dto;
import java.util.*;
public class BookingResponse {
    private Long bookingId;
    private Double totalAmount;
    private String status;
    private List<String> seats;

    public BookingResponse(){}
    public BookingResponse(Long bookingId, Double totalAmount, String status, List<String> seats){
        this.bookingId = bookingId;
        this.totalAmount = totalAmount;
        this.status = status;
        this.seats = seats;
    }
    
    public Long getBookingId(){
        return bookingId;
    }
    public void setBookingId(Long bookingId){
        this.bookingId = bookingId;
    }
    public Double getTotalAmount(){
        return totalAmount;
    }
    public void setTotalAmount(Double totalAmount){this.totalAmount = totalAmount;}
    public String getStatus(){return status;}
    public void setStatus(String status){this.status = status;}
    public List<String> getSeatIds(){return seats;}
    public void setSeatIds(List<String> seats){this.seatIds = seatIds;}

    
    

}
