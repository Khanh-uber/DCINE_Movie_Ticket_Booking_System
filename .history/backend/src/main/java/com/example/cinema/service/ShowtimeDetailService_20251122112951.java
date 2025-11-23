package com.example.cinema.service;

import org.springframework.stereotype.Service;

import com.example.cinema.dto.ShowtimeDetailResponse;
import com.example.cinema.repository.MovieRepository;
import com.example.cinema.repository.ShowTimeRepository;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
@Service
public class ShowtimeDetailService {
    private final ShowTimeRepository showtimeRepo;
    private final MovieRepository movieRepo;

    public ShowtimeDetailService(ShowTimeRepository showtimeRepo, MovieRepository movieRepo) {
        this.showtimeRepo = showtimeRepo;
        this.movieRepo = movieRepo;
    }
    public ShowtimeDetailResponse getShowtimeDetail(Long id){
        Map<String, Object> st = showtimeRepo.findShowtimeDetail(id);
        if st == null)
}
