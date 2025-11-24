package com.example.cinema.service;

import java.util.*;

import org.springframework.stereotype.Service;

import com.example.cinema.dto.ConcessionResponse;
import com.example.cinema.repository.ShowTimeRepository;

@Service
public class ConcessionService {
    private ShowTimeRepository showtimeRepo;
    public ConcessionService(ShowTimeRepository showtimeRepo){
        this.showtimeRepo = showtimeRepo;
    }

    public ConcessionResponse getRes(Long showtimeId){
        ConcessionResponse res = new ConcessionResponse();
    
    
        ConcessionResponse.TicketDTO ticketRes = new ConcessionResponse.TicketDTO();
    
        
        Map<String, Object> movieMeta = showtimeRepo.getShowtimeMeta(showtimeId);
        ticketRes.setMeta(movieMeta);
        
        
    }
    
    
    
}
