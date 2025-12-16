package com.example.cinema.service;

import java.util.List;

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

        // ---- 1) Exact match (tối ưu tốc độ & ít sai nhất) ----
        List<
        if (exact != null) return exact;

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

