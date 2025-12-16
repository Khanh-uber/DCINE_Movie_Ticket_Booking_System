package com.example.cinema.service;

import java.text.Normalizer;
import java.util.List;
import java.util.Map;

import org.apache.commons.text.similarity.LevenshteinDistance;
import org.springframework.stereotype.Service;

import com.example.cinema.dto.TheaterDTO;
import com.example.cinema.repository.LocationRepository;
import com.example.cinema.repository.TheaterRepository;

@Service
public class TheaterLookupService {

    private final TheaterRepository theaterRepo;
    private final LocationRepository locationRepo;

    public TheaterLookupService(TheaterRepository theaterRepo,LocationRepository locationRepo) {
        this.theaterRepo = theaterRepo;
        this.locationRepo = locationRepo;
    }

    public TheaterDTO findTheater(String theaterText, String locationText) {
        if (theaterText == null || theaterText.isBlank()) return null;

        String normTheater = normalize(theaterText);
        String normLocationText = normalize(locationText);

        // 1) lấy danh sách name từ DB
        List<com.example.cinema.entity.Theater> all = theaterRepo.findAll(); // 
        List<Map<String, Object>> allLocation = locationRepo.findAllLocations();
        List<TheaterDTO> dtos = all.stream().map(t -> {
            TheaterDTO dto = new TheaterDTO();
            dto.setId(t.getTheaterId());
            dto.setName(t.getName());
            return dto;

        }).toList();
        
        // ưu tiên match theater + location
        Long locationId = null;
        if (normLocationText != null || !normLocationText.isBlank()){
            for (Map<String, Object> m : allLocation){
                if (normLocationText == m.get("city_name")){
                    locationId = ((Number) m.get("location_id")).longValue();
                    break;
                }
            }
        }
        if (locationId != null){
            for (TheaterDTO the : )
        }

        // 2) exact by normalized
        TheaterDTO exact = null;
        for (TheaterDTO t : dtos) {
            if (normalize(t.getName()).equals(normTheater)) {
                exact = t;
                break;
            }
        }

        if (exact != null) return exact;

        // 3) fuzzy levenshtein
        TheaterDTO best = null;
        int bestScore = 999;

        for (TheaterDTO t : dtos) {
            int d = LevenshteinDistance.getDefaultInstance()
                    .apply(normInput, normalize(t.getName()));
            if (d < bestScore && d <= 3) {
                bestScore = d;
                best = t;
            }
        }
        return best;
    }
    public TheaterDTO findTheater(String input) {
        return findTheater(input, null);
    }
    private String normalize(String s) {
        if (s == null) return "";
        String r = Normalizer.normalize(s, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace("đ", "d").replace("Đ", "D")
                .toLowerCase()
                .replaceAll("[^a-z0-9 ]", " ")
                .replaceAll("\\s+", " ")
                .trim();
        return r;
    }
    
}

