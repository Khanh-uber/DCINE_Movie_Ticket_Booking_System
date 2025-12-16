package com.example.cinema.llm.detectors;

import org.apache.commons.text.similarity.LevenshteinDistance;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class MovieDetector {

    private final 
    private final List<String> movieList = List.of(
        "Mai", "Dune 2", "Thanh Sói", "Inside Out 2"
    );

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

