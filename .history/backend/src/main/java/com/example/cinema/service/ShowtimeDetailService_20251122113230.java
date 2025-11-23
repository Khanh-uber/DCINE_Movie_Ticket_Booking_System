package com.example.cinema.service;

import org.springframework.stereotype.Service;

import com.example.cinema.dto.ShowtimeDetailResponse;
import com.example.cinema.repository.MovieRepository;
import com.example.cinema.repository.ShowTimeRepository;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.sql.Timestamp;

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
        if (st == null)
            throw new RuntimeException("Khong tim thay xuat chieu");
        Long movieId = showtimeRepo.findMovieIdByShowtime(id);

        if (movieId == null) {
            throw new RuntimeException("Movie not found for showtime");
        }
        Timestamp ts = (Timestamp) st.get("start_at");
        LocalDateTime startAt = ts.toLocalDateTime();

        String date = startAt.toLocalDate().toString(); // yyyy-MM-dd
        String time = startAt.toLocalTime().format(DateTimeFormatter.ofPattern("HH:mm"));

        ShowtimeDetailResponse res = new ShowtimeDetailResponse();
        res.
    }
}
