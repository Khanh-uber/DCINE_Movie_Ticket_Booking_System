package com.example.cinema.service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import org.springframework.stereotype.Service;
import com.example.cinema.dto.MovieDTO;
import com.example.cinema.entity.Movie;

import com.example.cinema.repository.MovieRepository;
import com.example.cinema.repository.PersonRepository;




@Service
public class MovieService {

    private final MovieRepository movieRepo;
    private final PersonRepository personRepo ;

    public MovieService (MovieRepository movieRepo, PersonRepository personRepo){
        this.movieRepo = movieRepo;
        this.personRepo = personRepo;
    
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
        List<Movie> movies = movieRepo.findNowShowingMovies();
        List<MovieDTO> dtos = new ArrayList<>();

        for (Movie movie : movies){
            MovieDTO dto = MovieDTO.fromEntity(movie);

            dto.setGenres(movieRepo.findGenresByMovieId(movie.getId()));
            dto.setCast(personRepo.findCastByMovieId(movie.getId()));
            dto.setDirector(personRepo.findDirectorByMovieId(movie.getId()));
            dtos.add(dto);
        }
        
        return dtos;
    }
    
    public List<MovieDTO> getComingSoonMovies(){
        List<Movie> movies = movieRepo.findComingSoonMovies();
        List<MovieDTO> dtos = new ArrayList<>();

        for (Movie movie : movies){
            MovieDTO dto = MovieDTO.fromEntity(movie);

            dto.setGenres(movieRepo.findGenresByMovieId(movie.getId()));
            dto.setCast(personRepo.findCastByMovieId(movie.getId()));
            dto.setDirector(personRepo.findDirectorByMovieId(movie.getId()));
            dtos.add(dto);
        }
        return dtos;
    }
    public MovieDTO getMovieById(Long id){
        Movie movie = movieRepo.findByMovieId(id);
        
        MovieDTO dto = MovieDTO.fromEntity(movie);
        dto.setGenres(movieRepo.findGenresByMovieId(movie.getId()));
        dto.setCast(personRepo.findCastByMovieId(movie.getId()));
        dto.setDirector(personRepo.findDirectorByMovieId(movie.getId()));
        return dto;
    }
    public List<MovieDTO> getAllMovies(){
        List<Movie> movies = movieRepo.findAllMovies();
        List<MovieDTO> dtos = new ArrayList<>();
        for (Movie movie : movies){
            MovieDTO dto = MovieDTO.fromEntity(movie);

            dto.setGenres(movieRepo.findGenresByMovieId(movie.getId()));
            dto.setCast(personRepo.findCastByMovieId(movie.getId()));
            dto.setDirector(personRepo.findDirectorByMovieId(movie.getId()));
            dtos.add(dto);
        }
        return dtos;
    }
}
