package com.example.cinema.service;

import java.time.format.DateTimeFormatter;
import java.util.*;

import org.springframework.stereotype.Service;
import com.example.cinema.entity.*;
import com.example.cinema.dto.ConcessionCartRequest;
import com.example.cinema.dto.ConcessionMeruRespose;
import com.example.cinema.dto.ConcessionResponse;
import com.example.cinema.dto.ConcessionResponse.ComboItem;
import com.example.cinema.repository.BookingConcessionRepository;
import com.example.cinema.repository.BookingRepository;
import com.example.cinema.repository.BookingSeatRepository;
import com.example.cinema.repository.ConcessionItemRepository;
import com.example.cinema.repository.ConcessionVariantRepository;
import com.example.cinema.repository.SeatLayoutRepository;
import com.example.cinema.repository.SeatTypeRepository;
import com.example.cinema.repository.ShowTimeRepository;


@Service
public class ConcessionService {
    private final ShowTimeRepository showtimeRepo;
    private final BookingRepository bookingRepo;
    private final SeatLayoutRepository seatLayoutRepo;
    private final SeatTypeRepository seatTypeRepo;
    private final BookingSeatRepository bookingSeatRepo;
    private final ConcessionItemRepository concessionRepo;
    private final ConcessionVariantRepository concessionVariantRepo;
    private final BookingConcessionRepository bookingConcessionRepo;
    private final ConcessionItemRepository concessionItemRepo;
    public ConcessionService(ShowTimeRepository showtimeRepo
    ,SeatLayoutRepository seatLayoutRepo,SeatTypeRepository seatTypeRepo,
                BookingRepository bookingRepo, BookingSeatRepository bookingSeatRepo ,
                ConcessionItemRepository concessionRepo,ConcessionVariantRepository concessionVariantRepo
            ,BookingConcessionRepository bookingConcessionRepo,ConcessionItemRepository concessionItemRepo){
        this.showtimeRepo = showtimeRepo;
        this.concessionRepo = concessionRepo;
 
}
