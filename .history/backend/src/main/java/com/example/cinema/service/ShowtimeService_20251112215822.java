package com.example.cinema.service;

import com.example.cinema.repository.ShowTimeRepository;

import java.util.LinkedHashMap;
import java.util.*;
import com.example.cinema.dto.*;
public class ShowtimeService {
    private final ShowTimeRepository showtimeRepo;
    public ShowtimeService(ShowTimeRepository showtimeRepo){
        this.showtimeRepo = showtimeRepo;
    }
    public ShowtimeDTO getAllShowtimes(){

        List<Map<String, Object>> rows = showtimeRepo.findAllShowtimes();
        Map<String, ShowtimeItem> grouped = new LinkedHashMap<>();
        
        for (Map<String, Object> row : rows){
            Long movieId = row.get("movie_id").
        }

    }
    
}
