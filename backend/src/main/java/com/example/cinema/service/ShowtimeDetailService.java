package com.example.cinema.service;

import org.springframework.stereotype.Service;
import com.example.cinema.entity.*;
import com.example.cinema.dto.ShowtimeDetailDTO;
import com.example.cinema.dto.ShowtimeDetailResponse;
import com.example.cinema.dto.ShowtimeSeatMapResponse;
import com.example.cinema.repository.MovieRepository;
import com.example.cinema.repository.SeatTypeRepository;
import com.example.cinema.repository.ShowTimeRepository;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.sql.Timestamp;

@Service
public class ShowtimeDetailService {
    private final ShowTimeRepository showtimeRepo;
    private final MovieRepository movieRepo;
    private final SeatTypeRepository seatTypeRepo;

    public ShowtimeDetailService(ShowTimeRepository showtimeRepo, MovieRepository movieRepo, SeatTypeRepository seatTypeRepo) {
        this.showtimeRepo = showtimeRepo;
        this.movieRepo = movieRepo;
        this.seatTypeRepo = seatTypeRepo;
    }
    public ShowtimeSeatMapResponse getSeatMapDetail(Long id){
        Map<String, Object> st = showtimeRepo.findShowtimeDetailRaw(id);
        if (st == null)
            throw new RuntimeException("Không tìm thấy suất chiếu");
        Long movieId = showtimeRepo.findMovieIdByShowtime(id);
        if (movieId == null)
            throw new RuntimeException("Movie not found for showtime");

        // ==== Parse time ====
        Timestamp ts = (Timestamp) st.get("start_at");
        LocalDateTime startAt = ts.toLocalDateTime();
        String date = startAt.toLocalDate().toString(); 
        String time = startAt.toLocalTime().format(DateTimeFormatter.ofPattern("HH:mm"));

        // ==== CREATE DTO ====
        ShowtimeSeatMapResponse res = new ShowtimeSeatMapResponse();
        // ==== BASIC SHOWTIME INFO ====
        res.setShowtimeId(id);
        res.setTheaterName((String) st.get("theater_name"));
        res.setShowDate(date);
        res.setStartTime(time);
        res.setFormatName((String) st.get("format_name")); 
        
        // ==== MOVIE INFO ====
        Movie m = movieRepo.findByMovieId(movieId);
        if (m == null) throw new RuntimeException("Không tìm thấy movie");

        List<String> genres = movieRepo.findGenresByMovieId(movieId);

        res.setMovieId(m.getId());
        res.setMovieTitle(m.getTitle());
        res.setReleaseYear(((Number) st.get("release_year")).intValue());
        res.setDurationMin(m.getDurationMin());
        res.setPosterUrl(m.getPosterUrl());
        res.setTrailerUrl(m.getTrailerUrl());
        res.setGenres(genres);


        // Pricing
        Double basePrice = ((Number) st.get("base_price")).doubleValue();
        Long hallId = ((Number) st.get("hall_id")).longValue();

        List<Map<String, Object>> price = seatTypeRepo.findPricingByHall(hallId);
        
        Map<String, ShowtimeSeatMapResponse.ZonePrice> zonePrices = new HashMap<>();

        for (Map<String, Object> row : price){
            String code = ((String) row.get("name")).toLowerCase();
            double multiplier = ((Number) row.get("price_multiplier")).doubleValue();

            double adult = basePrice * multiplier;
            Double child = code.equals("couple") ? null : adult * 0.8; // ghe couple khong co gia tr em
            
            zonePrices.put(code, new ShowtimeSeatMapResponse.ZonePrice(adult, child));
        }

        ShowtimeSeatMapResponse.Pricing pricing = new ShowtimeSeatMapResponse.Pricing(zonePrices);
        res.setPricing(pricing);
        

        return res;
    }
    
}
