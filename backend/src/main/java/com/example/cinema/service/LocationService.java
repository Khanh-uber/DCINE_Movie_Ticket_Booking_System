package com.example.cinema.service;

import com.example.cinema.repository.LocationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class LocationService {

    private final LocationRepository repo;

    public LocationService(LocationRepository repo) {
        this.repo = repo;
    }

    public List<Map<String,Object>> getAll() {
        return repo.findAllLocations();
    }
}
