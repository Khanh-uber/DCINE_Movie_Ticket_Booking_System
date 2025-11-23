package com.example.cinema.service;

import org.springframework.stereotype.Service;

import com.example.cinema.repository.MovieRepository;
import com.example.cinema.repository.ShowTimeRepository;

@Service
public class ShowtimeDetailService {
    private final ShowTimeRepository showtimeRepo;
    private final MovieRepository movieRepo;

    public ShowtimeDetailService(ShowTimeRepository showtimeRepo, MovieRepository movieRepo) {
        this.showtimeRepo = showtimeRepo;
        this.movieRepo = movieRepo;
    }
    
}
