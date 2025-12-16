package com.example.cinema.service;

import java.text.Normalizer;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.text.similarity.LevenshteinDistance;
import org.springframework.stereotype.Service;

import com.example.cinema.entity.Movie;
import com.example.cinema.repository.MovieRepository;

@Service
public class MovieLookupService {

    private final MovieRepository movieRepo;
    

    public MovieLookupService(MovieRepository movieRepo) {
        this.movieRepo = movieRepo;
    }

    public Movie findMovie(String llmMovieName) {
        System.out.println("\n===== [MovieLookup] START =====");
        System.out.println("LLM raw movie name = " + llmMovieName);

        if (llmMovieName == null) {
            System.out.println("[MovieLookup] -> NULL input → return null");
            return null;
        

        String norm = normalize(llmMovieName);
        

        // 1) Lấy toàn bộ titles từ DB
        List<String> titles = movieRepo.findAllMovieTitles();
        
        
        // 2) Normalize tất cả titles
        Map<String, String> normalizedMap = new HashMap<>();
        for (String t : titles) {
            normalizedMap.put(t, normalize(t));
        }
        // 3) Exact match
        for (Map.Entry<String, String> entry : normalizedMap.entrySet()) {
            if (entry.getValue().equals(norm)) {
                return movieRepo.findByTitle(entry.getKey());
            }
        }
        // 4) Fuzzy match
        String bestTitle = null;
        int bestScore = 999;

        for (Map.Entry<String, String> entry : normalizedMap.entrySet()) {
            int d = LevenshteinDistance.getDefaultInstance()
                    .apply(norm, entry.getValue());
            if (d < bestScore && d <= 3) {
                bestScore = d;
                bestTitle = entry.getKey();
            }
        }

        if (bestTitle != null) {
            return movieRepo.findByTitle(bestTitle);
        }

        return null; // không tìm thấy
    }

    private String normalize(String s) {
        if (s == null) return "";
        String r = Normalizer.normalize(s, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace("đ", "d").replace("Đ", "D")
                .toLowerCase()
                .replaceAll("[^a-z0-9 ]", "")
                .replaceAll("\\s+"," ")
                .trim();
        return r;
    }
}

