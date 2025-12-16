package com.example.cinema.service;

import com.example.cinema.dto.ShowtimeDTO;
import com.example.cinema.dto.ShowtimeDetailDTO;
import com.example.cinema.dto.ShowtimeFlatDTO;
import com.example.cinema.repository.ShowTimeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
public class ShowtimeService {

    private final ShowTimeRepository repo;

    public ShowtimeService(ShowTimeRepository repo) {
        this.repo = repo;
    }

    public List<Map<String, Object>> getShowtimesForFE(Long movieId, Long provinceId) {
        return repo.findShowtimesForFE(movieId, provinceId);
    }

    public ShowtimeDetailDTO getShowtimeDetail(Long id) {
        Map<String,Object> raw = repo.findShowtimeDetailRaw(id);
        return ShowtimeDetailDTO.fromRaw(raw);
    }

    public List<ShowtimeFlatDTO> getShowtimesByMovieAndDate(Long movieId, LocalDate date) {
        return repo.findShowtimeByMovieAndDate(movieId, date);
    }

    public List<ShowtimeFlatDTO> getShowtimesByTheaterAndDate(Long theaterId, LocalDate date) {
        List<Map<String, Object>> rows = repo.findShowtimesByTheaterAndDateRaw(theaterId, date);
        
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        return rows.stream().map(r -> {
            ShowtimeFlatDTO dto = new ShowtimeFlatDTO();
            dto.setStartAt(String.valueOf(r.get("startAt")));
            dto.setEndAt(String.valueOf(r.get("endAt")));
            dto.setHallName(String.valueOf(r.get("hallName")));
            dto.setTheaterName(String.valueOf(r.get("theaterName")));
            dto.setMovieTitle(String.valueOf(r.get("movieTitle")));
            return dto;
        }).toList();
    }
}
