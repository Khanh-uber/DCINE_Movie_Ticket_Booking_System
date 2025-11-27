package com.example.cinema.service;

import java.util.*;

import org.springframework.stereotype.Service;
import com.example.cinema.entity.*;
import com.example.cinema.dto.ConcessionListResponse;
import com.example.cinema.dto.ConcessionResponse;
import com.example.cinema.repository.BookingRepository;
import com.example.cinema.repository.ConcessionItemRepository;
import com.example.cinema.repository.ConcessionVariantRepository;
import com.example.cinema.repository.ShowTimeRepository;

@Service
public class ConcessionService {
    private final ShowTimeRepository showtimeRepo;
    private final ConcessionItemRepository itemRepo;
    private final ConcessionVariantRepository variantRepo;
    private final BookingRepository bookingRepo;
    public ConcessionService(ShowTimeRepository showtimeRepo, ConcessionItemRepository itemRepo, 
        ConcessionVariantRepository variantRepo,
        BookingRepository bookingRepo){
        this.showtimeRepo = showtimeRepo;
        this.itemRepo = itemRepo;
        this.variantRepo = variantRepo;
        this.bookingRepo = bookingRepo;
    }

    public ConcessionResponse loadSummary(){
        ConcessionResponse res = new ConcessionResponse();

        // 1) Load BookingId theo account
        Long accountId = 1L;
        Booking booking = bookingRepo.findPendingBookingByAccountId(1L);
        
        long ticketTotal = 0;
        
    }
}
