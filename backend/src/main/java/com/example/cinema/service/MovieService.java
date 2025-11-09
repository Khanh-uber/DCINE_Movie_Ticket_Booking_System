package com.example.cinema.service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import org.springframework.stereotype.Service;
import com.example.cinema.dto.MovieDTO;
import com.example.cinema.entity.Movie;
import com.example.cinema.entity.Showtime;
import com.example.cinema.repository.MovieRepository;
import com.example.cinema.repository.ShowTimeRepository;



@Service
public class MovieService {

    private final MovieRepository movieRepo;
    public MovieService (MovieRepository movieRepo){
        this.movieRepo = movieRepo;
    
    }
    public List<MovieDTO> getMoviesByStatus(String status) {
        switch (status.toLowerCase()) {
            case "now":
                return movieRepo.findNowShowingMovies()
                        .stream().map(MovieDTO::fromEntity).toList();

            case "soon":
                return movieRepo.findComingSoonMovies()
                        .stream().map(MovieDTO::fromEntity).toList();
            default:
                throw new IllegalArgumentException("Trạng thái phim không hợp lệ: " + status);
        }
    }
    // phim dang chieu 
    public List<MovieDTO> getNowShowingMovies() {
        return movieRepo.findNowShowingMovies()
                .stream()
                .map(MovieDTO::fromEntity)
                .toList();
    }
    
    public List<MovieDTO> getComingSoonMovies(){
        return movieRepo.findComingSoonMovies()
                .stream()
                .map(MovieDTO::fromEntity) 
                .toList();
    }
}
