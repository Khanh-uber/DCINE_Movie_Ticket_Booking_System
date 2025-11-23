package com.example.cinema.service;

import com.example.cinema.repository.MovieRepository;
import com.example.cinema.repository.MovieRepository;
public class ShowtimeDetailService {
    private final ShowtimeRepository showtimeRepo;
    private final MovieRepository movieRepo;

    public ShowtimeDetailService(ShowtimeRepository showtimeRepo, MovieRepository movieRepo) {
        this.showtimeRepo = showtimeRepo;
        this.movieRepo = movieRepo;
    }

}
