package com.example.cinema.service;

import org.springframework.stereotype.Service;
import com.example.cinema.entity.*;
import com.example.cinema.dto.ShowtimeDetailResponse;
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

        ShowtimeDetailResponse.ShowtimeInfo stInfo = new ShowtimeDetailResponse.ShowtimeInfo();
        String date = startAt.toLocalDate().toString(); // yyyy-MM-dd
        String time = startAt.toLocalTime().format(DateTimeFormatter.ofPattern("HH:mm"));
        Long showtimeId = ((Number) st.get("showtime_id")).longValue();
        String theaterName = (String) st.get("theater_name");
        stInfo.setDate(date);
        stInfo.setFormat("2D");
        stInfo.setId(showtimeId);
        stInfo.setTheaterName(theaterName);
        stInfo.setTime(time);

        ShowtimeDetailResponse res = new ShowtimeDetailResponse();

        res.setShowtime(stInfo);
        res
        
        ShowtimeDetailResponse.Theater stTheather= new ShowtimeDetailResponse.Theater();
        stTheather.setId(((Number)st.get("theater_id")).longValue());
        stTheather.setName(theaterName);
        
        res.setTheater(stTheather);
        // res.setShowtimeId(showtimeId);
        // Lay thong tin movie
        Movie m = movieRepo.findByMovieId(movieId);
        if (m == null)
            throw new RuntimeException("Khong tim thay movie");
        List<String> genres = movieRepo.findGenresByMovieId(movieId);
        List<String> casts = movieRepo.findCastByMovieId(movieId);
        String directors = movieRepo.findDirectorByMovieId(movieId);

        ShowtimeDetailResponse.Movie stMovie = new ShowtimeDetailResponse.Movie();
        stMovie.setId(m.getId());
        stMovie.setTitle(m.getTitle());
        stMovie.setOriginalTitle(m.getOriginalTitle());
        stMovie.setPosterUrl(m.getPosterUrl());
        stMovie.setBackdropUrl(m.getBackDropUrl());
        stMovie.setTrailerUrl(m.getTrailerUrl());
        stMovie.setRating(m.getRating() != null ? Double.valueOf(m.getRating()) : null);
        String rated = m.getRated();
        if (rated != null && rated.length() >= 3) {
            stMovie.setRated(rated.substring(0, 3));
        }
        stMovie.setDuration(m.getDurationMin());
        stMovie.setLanguage(m.getLanguage());
        stMovie.setReleaseDate(m.getReleaseDate() != null ? m.getReleaseDate().toString() : null);
        stMovie.setSynopsis(m.getSynopsis());
        stMovie.setGenres(genres);
        stMovie.setDirector(directors);
        stMovie.setCast(casts);

        res.setMovie(stMovie);
        // Pricing
        double basePrice = ((Number) st.get("base_price")).doubleValue();
        Long hallId = ((Number) st.get("hall_id")).longValue();

        List<Map<String, Object>> price = seatTypeRepo.findPricingByHall(hallId);
        
        Map<String, ShowtimeDetailResponse.Price> zonePrices = new HashMap<>();

        for (Map<String, Object> row : price){
            String code = (String) row.get("name");
            double multiplier = ((Number) row.get("price_multiplier")).doubleValue();

            code = code.toLowerCase(); // normalize
            int adult = (int) Math.round(basePrice * multiplier);
            Integer child = code.equals("couple") ? null : (int) Math.round(adult * 0.8); // ghe couple khong co gia tr em
            
            zonePrices.put(code, new ShowtimeDetailResponse.Price(adult, child));
        }
        ShowtimeDetailResponse.Pricing pricing = new ShowtimeDetailResponse.Pricing(zonePrices);
        res.setPricing(pricing);
        
        return res;
    }
}
