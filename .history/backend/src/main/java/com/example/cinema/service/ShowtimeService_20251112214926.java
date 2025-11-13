package com.example.cinema.service;

import com.example.cinema.repository.ShowTimeRepository;

import java.util.LinkedHashMap;

import com.example.cinema.dto.*;
public class ShowtimeService {
    private final ShowTimeRepository showtimeRepo;
    public ShowtimeService(ShowTimeRepository showtimeRepo){
        this.showtimeRepo = showtimeRepo;
    }
    public ShowtimeDTO getAllShowtimes(){
        Map<String, ShowtimeItem> grouped = new LinkedHashMap<>()
    }
    
}
