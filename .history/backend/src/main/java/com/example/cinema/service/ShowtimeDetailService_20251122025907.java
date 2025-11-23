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
        if (st == null) {
            throw new RuntimeException("Không tìm thấy suất chiéu");
        }

        Long movieId = showtimeRepo.findMovieIdByShowtime(id);

        LocalDateTime startAt = ((java.sql.Timestamp) st.get("start_at")).toLocalDateTime();

        String date = startAt.toLocalDate().toString();
        String time = startAt.toLocalTime().format(DateTimeFormatter.ofPattern("HH:mm"));


        // build showtime info
        ShowtimeDetailResponse.ShowtimeInfo stDTO = new ShowtimeDetailResponse.ShowtimeInfo();
        stDTO.setId(((Number) st.get("showtime_id")).longValue());
        stDTO.setTheaterName((String) st.get("theater_name"));
        stDTO.setDate(date);
        stDTO.setTime(time);
        stDTO.setFormat("2D");


        Map<String, Object> mvMap = movieRepo.findMovieInfo(movieId);
        List<String> genres = movieRepo.findGenresByMovieId(movieId);

        ShowtimeDetailResponse.MovieInfo mvDto = new ShowtimeDetailResponse.MovieInfo();
        
    }
}
