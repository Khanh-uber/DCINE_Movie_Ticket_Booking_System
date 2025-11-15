package com.example.cinema.service;

import com.example.cinema.repository.LocationRepository;
import org.springframework.stereotype.Service;
import java.util.*;
@Service
public class LocationService {
    private final LocationRepository locationRepo;
    public LocationService(LocationRepository locationRepo){
        this.locationRepo = locationRepo;
    }

    public List<Location> findAll() {
        return repo.findAll();
    }

}
