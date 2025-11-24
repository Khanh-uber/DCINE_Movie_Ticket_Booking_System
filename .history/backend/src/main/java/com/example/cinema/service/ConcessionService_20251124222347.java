package com.example.cinema.service;

import java.util.*;

import org.springframework.stereotype.Service;
import com.example.cinema.entity.*;
import com.example.cinema.dto.ComboResponse;
import com.example.cinema.dto.ConcessionResponse;
import com.example.cinema.repository.ComboRepository;
import com.example.cinema.repository.ComboVariantRepository;
import com.example.cinema.repository.ShowTimeRepository;

@Service
public class ConcessionService {
    private final ShowTimeRepository showtimeRepo;
    private final ComboRepository comboRepo;
    private final ComboVariantRepository comboVariantRepo;
    public ConcessionService(ShowTimeRepository showtimeRepo, ComboRepository comboRepo, ComboVariantRepository combo){
        this.showtimeRepo = showtimeRepo;
        this.comboRepo = comboRepo;
        this.com
    }
    public ComboResponse getAllCombos(){
        List<Combo> combos = comboRepo.findByActive();
        List<ComboResponse.Item> list = new ArrayList<>();
        
        for (Combo c: combos ){
            ComboResponse.Item dto = new ComboResponse.Item();
            dto.setId(c.getComboId());
            dto.setCode(c.getCode());
            dto.setTitle(c.getTitle());
            dto.setDescription(c.getDescription());
            dto.setPrice(c.getPrice());
            dto.setOldPrice(c.getOldPrice());
            dto.setTag(c.getTag());
            dto.setImageUrl(c.getComboUrl());
            dto.setCategory("combo");
            dto.setVariants(new ArrayList<>()); // FE yêu cầu mảng rỗng
            list.add(dto);
        }
        List<Combo> 
        return new ComboResponse(list);
    }
    
    
    
}
