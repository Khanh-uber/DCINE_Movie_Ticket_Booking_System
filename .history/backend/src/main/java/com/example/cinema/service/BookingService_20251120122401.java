package com.example.cinema.service;

import org.springframework.stereotype.Service;

import com.example.cinema.dto.BookingRequest;
import com.example.cinema.dto.BookingResponse;
import com.example.cinema.repository.BookingSeatRepository;
import com.example.cinema.repository.SeatRepository;
import com.example.cinema.repository.ShowTimeRepository;

@Service
public class BookingService {
    private ShowTimeRepository showtimeRepo;
    private BookingSeatRepository bookingSeatRepo;
    private SeatRepository seatRepo;
    

    public BookingResponse bookSeats(BookingRequest req){
        Long showtimeId = req.get
    }
}
