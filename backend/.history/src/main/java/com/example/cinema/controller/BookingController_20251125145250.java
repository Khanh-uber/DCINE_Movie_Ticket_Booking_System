package com.example.cinema.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.cinema.dto.BookingRequest;
import com.example.cinema.service.BookingService;
import java.util.*;
@RestController
@RequestMapping("/api")
public class BookingController {
    private final BookingService bookingService;
    private final BookingRequest bookingRequest;
    public BookingController(ValidateRequest bookingRequest, BookingService bookingService){
        this.bookingRequest = bookingRequest;
        this.bookingService = bookingService;
    }



}