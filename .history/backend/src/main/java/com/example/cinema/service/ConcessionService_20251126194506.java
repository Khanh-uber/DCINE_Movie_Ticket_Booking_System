package com.example.cinema.service;

import java.util.*;

import org.springframework.stereotype.Service;
import com.example.cinema.entity.*;
import com.example.cinema.dto.ConcessionListResponse;
import com.example.cinema.dto.ConcessionResponse;
import com.example.cinema.repository.ConcessionItemRepository;
import com.example.cinema.repository.ConcessionVariantRepository;
import com.example.cinema.repository.ShowTimeRepository;

@Service
public class ConcessionService {
    private final ShowTimeRepository showtimeRepo;
    private final ConcessionItemRepository itemRepo;
    private final ConcessionVariantRepository variantRepo;
    public ConcessionService(ShowTimeRepository showtimeRepo, ConcessionItemRepository itemRepo, ConcessionVariantRepository variantRepo){
        this.showtimeRepo = showtimeRepo;
        this.itemRepo = itemRepo;
        this.variantRepo = variantRepo;
    }

    
}
