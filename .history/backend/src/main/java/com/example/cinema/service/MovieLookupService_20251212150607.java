package com.example.cinema.service;

import java.text.Normalizer;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.text.similarity.LevenshteinDistance;
import org.springframework.stereotype.Service;

import com.example.cinema.dto.ShowtimeDetailResponse.Movie;
import com.example.cinema.repository.MovieRepository;

@Service
public class MovieLookupService {

    private final MovieRepository movieRepo;
    

    public MovieLookupService(MovieRepository movieRepo) {
        this.movieRepo = movieRepo;
    }

    public Movie findMovie(String llmMovieName) {

        if (llmMovieName == null) return null;

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
            if (entry.getValue().equals(normInput)) {
                return movieRepo.findByTitle(entry.getKey());
            }
        }
        // ---- 2) Fuzzy match fallback ----
        List<Movie> all = movieRepo.findAll();
        Movie best = null;
        int bestScore = 999;

        for (Movie mv : all) {
            int d = LevenshteinDistance.getDefaultInstance()
                    .apply(norm, normalize(mv.getTitle()));

            if (d < bestScore && d <= 3) { // threshold an toàn
                bestScore = d;
                best = mv;
            }
        }

        return best; // có thể null
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

