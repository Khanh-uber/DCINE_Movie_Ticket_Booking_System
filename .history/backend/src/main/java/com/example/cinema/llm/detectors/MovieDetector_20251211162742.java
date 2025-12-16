package com.example.cinema.llm.detectors;

import org.apache.commons.text.similarity.LevenshteinDistance;
import org.springframework.stereotype.Component;

import com.example.cinema.repository.MovieRepository;

import java.util.List;

@Component
public class MovieDetector {

    private final MovieRepository movieRepo;
    

    public MovieDetector(MovieRepository movieRepo) {
        this.movieRepo = movieRepo;
    }

    public String detect(String text) {
        String norm = normalize(text);

        // Exact match
        for (String m : movieList) {
            if (norm.contains(normalize(m))) return m;
        }

        // Fuzzy
        String best = null;
        int bestScore = 999;

        for (String m : movieList) {
            int d = LevenshteinDistance.getDefaultInstance()
                    .apply(norm, normalize(m));
            if (d < bestScore && d <= 2) {
                bestScore = d;
                best = m;
            }
        }
        return best;
    }

    private String normalize(String s) {
        return s.toLowerCase()
                .replaceAll("[^a-z0-9 ]", "")
                .replaceAll("\\s+", "");
    }
}

