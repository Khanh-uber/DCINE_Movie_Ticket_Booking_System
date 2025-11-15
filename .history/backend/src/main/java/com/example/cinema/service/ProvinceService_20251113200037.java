package com.example.cinema.service;


import org.springframework.stereotype.Service;

import com.example.cinema.entity.Province;
import com.example.cinema.repository.ProvinceRepository;
import java.util.*;
@Service
public class ProvinceService {

    private final ProvinceRepository provinceRepo;
    public ProvinceService(ProvinceRepository provinceRepo ){
        this.provinceRepo = provinceRepo;
    }
    public List<Province> getAllProvinces(){
        return provinceRepo.findAllProvince()
    }
}
