package com.example.cinema.service;

import java.util.*;

import org.springframework.stereotype.Service;

import com.example.cinema.dto.ConcessionResponse;
import com.example.cinema.repository.ComboRepository;
import com.example.cinema.repository.ShowTimeRepository;

@Service
public class ConcessionService {
    private ShowTimeRepository showtimeRepo;
    private final ComboRepository comboRepo;
    public ConcessionService(ShowTimeRepository showtimeRepo, Com){
        this.showtimeRepo = showtimeRepo;
    }
    
    
    
}
