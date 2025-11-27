package com.example.cinema.service;

import com.example.cinema.repository.ProvinceRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class ProvinceService {

    private final ProvinceRepository repo;

    public ProvinceService(ProvinceRepository repo) {
        this.repo = repo;
    }

    public List<Map<String, Object>> getAllProvinces() {
        return repo.getAllProvinces();
    }

    public List<Map<String, Object>> getLocationsByProvinceId(Long provinceId) {
        return repo.getLocationsByProvince(provinceId);
    }
}
