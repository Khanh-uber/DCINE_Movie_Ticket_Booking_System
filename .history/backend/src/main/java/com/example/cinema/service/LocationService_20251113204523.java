package com.example.cinema.service;

import com.example.cinema.repository.LocationRepository;

@Service
public class LocationService {
    private final LocationRepository locationRepo;
    public LocationService(LocationRepository locationRepo){
        this.locationRepo = locationRepo;
    }
    
}
