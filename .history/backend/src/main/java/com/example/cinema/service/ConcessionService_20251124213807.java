package com.example.cinema.service;

import java.util.*;

import org.springframework.stereotype.Service;
import com.example.cinema.entity.*;
import com.example.cinema.dto.ComboResponse;
import com.example.cinema.dto.ConcessionResponse;
import com.example.cinema.repository.ComboRepository;
import com.example.cinema.repository.ShowTimeRepository;

@Service
public class ConcessionService {
    private ShowTimeRepository showtimeRepo;
    private final ComboRepository comboRepo;
    public ConcessionService(ShowTimeRepository showtimeRepo, ComboRepository comboRepo ){
        this.showtimeRepo = showtimeRepo;
        this.comboRepo = comboRepo;
    }
    public ComboResponse getAllCombos(){
        List<Combo> combos = comboRepo.findByActive();
        List<CompoResponse.
    }
    
    
    
}
