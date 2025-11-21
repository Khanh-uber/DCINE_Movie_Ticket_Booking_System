package com.example.cinema.service;

import org.springframework.stereotype.Service;

import com.example.cinema.repository.BookingSeatRepository;
import com.example.cinema.repository.ShowTimeRepository;

@Service
public class BookingService {
    private ShowTimeRepository showtimeRepo;
    private BookingSeatRepository bookingRepo;
    
}
