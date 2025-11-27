package com.example.cinema.service;

import com.example.cinema.dto.ShowtimeDetailDTO;
import com.example.cinema.repository.ShowTimeRepository;
import org.springframework.stereotype.Service;

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

}
