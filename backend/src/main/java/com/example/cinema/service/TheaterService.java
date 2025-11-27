package com.example.cinema.service;

import com.example.cinema.repository.TheaterRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class TheaterService {

    private final TheaterRepository repo;

    public TheaterService(TheaterRepository repo) {
        this.repo = repo;
    }

    public List<Map<String, Object>> getTheaters(Long provinceId) {
        return repo.findTheaters(provinceId);
    }
}
