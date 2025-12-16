package com.example.cinema.service;

import java.text.Normalizer;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.text.similarity.LevenshteinDistance;
import org.springframework.stereotype.Service;

import com.example.cinema.dto.MovieDTO;
import com.example.cinema.entity.Movie;
import com.example.cinema.repository.MovieRepository;
import com.example.cinema.repository.PersonRepository;

@Service
public class MovieLookupService {

    private final MovieRepository movieRepo;
    private final PersonRepository personRepo ;

    public MovieLookupService(MovieRepository movieRepo, PersonRepository personRepo) {
        this.movieRepo = movieRepo;
        this.personRepo = personRepo;
    }

    public MovieDTO findMovie(String llmMovieName) {
        System.out.println("\n===== [MovieLookup] START =====");
        System.out.println("LLM raw movie name = " + llmMovieName);

        if (llmMovieName == null) {
            System.out.println("[MovieLookup] -> NULL input → return null");
            return null;
        }
        

        String norm = normalize(llmMovieName);
        System.out.println("Normalized LLM movie name = " + norm);

        // 1) Lấy toàn bộ titles từ DB
        List<String> titles = movieRepo.findAllMovieTitles();
        
        
        // 2) Normalize tất cả titles
        Map<String, String> normalizedMap = new HashMap<>();
        for (String t : titles) {
            normalizedMap.put(t, normalize(t));
            System.out.println(" - DB title: '" + t + "' → '" + normalize(t)+ "'");
        }
        // 3) Exact match
        for (Map.Entry<String, String> entry : normalizedMap.entrySet()) {
            if (entry.getValue().equals(norm)) {
                String matchedTitle = entry.getKey();
                

                Movie movie = movieRepo.findByTitle(matchedTitle);
                MovieDTO dto = MovieDTO.fromEntity(movie);
            
                dto.setGenres(movieRepo.findGenresByMovieId(movie.getId()));
                dto.setCast(personRepo.findCastByMovieId(movie.getId()));
                dto.setDirector(personRepo.findDirectorByMovieId(movie.getId()));
                System.out.println("[Exact MATCH] '" + matchedTitle + "'");
                System.out.println("===== [MovieLookup] END =====\n");
                return dto;
            }
        }
        // 4) Fuzzy match
        String bestTitle = null;
        int bestScore = 999;

        for (Map.Entry<String, String> entry : normalizedMap.entrySet()) {
            int d = LevenshteinDistance.getDefaultInstance()
                    .apply(norm, entry.getValue());
            System.out.println("Compare to '" + entry.getKey() + "' distance = " + d);
            if (d < bestScore && d <= 3) {
                bestScore = d;
                bestTitle = entry.getKey();
            }
        }

        if (bestTitle != null) {
            System.out.println("[Fuzzy MATCH] bestTitle = " + bestTitle + ", score = " + bestScore);
            System.out.println("===== [MovieLookup] END =====\n");
            Movie movie = movieRepo.findByTitle(bestTitle);
            MovieDTO dto = MovieDTO.fromEntity(movie);
            
            dto.setGenres(movieRepo.findGenresByMovieId(movie.getId()));
            dto.setCast(personRepo.findCastByMovieId(movie.getId()));
            dto.setDirector(personRepo.findDirectorByMovieId(movie.getId()));
            return dto;
        }

        System.out.println("[MovieLookup] NO MATCH FOUND");
        System.out.println("===== [MovieLookup] END =====\n");
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

