package com.example.cinema.service;

import java.text.Normalizer;
import java.util.List;

import org.apache.commons.text.similarity.LevenshteinDistance;
import org.springframework.stereotype.Service;

import com.example.cinema.dto.TheaterDTO;
import com.example.cinema.dto.ShowtimeDetailResponse.Theater;
import com.example.cinema.repository.TheaterRepository;

@Service
public class TheaterLookupService {

    private final TheaterRepository theaterRepo;

    public TheaterLookupService(TheaterRepository theaterRepo) {
        this.theaterRepo = theaterRepo;
    }

    public TheaterDTO findTheater(String input) {
        if (input == null || input.isBlank()) return null;

        String normInput = normalize(input);

        // 1) lấy danh sách name từ DB
        List<Theater> all = theaterRepo.findAll(); 
        List<TheaterDTO> dtos = 
        // 2) exact by normalized
        TheaterDTO exact = null;
        for (TheaterDTO t : all) {
            if (normalize(t.getName()).equals(normInput)) {
                exact = t;
                break;
            }
        }
        if (exact != null) return exact;

        // 3) fuzzy levenshtein
        TheaterDTO best = null;
        int bestScore = 999;

        for (TheaterDTO t : all) {
            int d = LevenshteinDistance.getDefaultInstance()
                    .apply(normInput, normalize(t.getName()));
            if (d < bestScore && d <= 3) {
                bestScore = d;
                best = t;
            }
        }
        return best;
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

