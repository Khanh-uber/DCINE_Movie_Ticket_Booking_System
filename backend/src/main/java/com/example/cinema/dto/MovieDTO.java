package com.example.cinema.dto;

import com.example.cinema.entity.Movie;


import java.time.LocalDate;


public class MovieDTO {
    private String id;
    private String title;
    private String posterUrl;
    private String trailerUrl;
    private Double rating;
    private LocalDate releaseDate;
    private Integer durationMin;
    private String status;

    // 
    public MovieDTO() {}

    public MovieDTO (String Id, String title, String posterUrl, String trailerUrl, Double rating, LocalDate releaseDate, Integer duration_min){
        this.id = Id;
        this.title = title;
        this.trailerUrl = trailerUrl;
        this.posterUrl = posterUrl;
        this.rating = rating;
        this.releaseDate = releaseDate;
        this.durationMin = duration_min;
    }
    

    // ✅ Getter + Setter cho tất cả field
    public String getId(){return id;}
    public void setId(String id){this.id = id;}

    public String getStatus() {return this.status;}
    public void setStatus(String status){this.status = status;}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    // public String getSynopsis() { return synopsis; }
    // public void setSynopsis(String synopsis) { this.synopsis = synopsis; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getDurationMin() { return durationMin; }
    public void setDurationMin(Integer durationMin) { this.durationMin = durationMin; }

    public LocalDate getReleaseDate() { return releaseDate; }
    public void setReleaseDate(LocalDate releaseDate) { this.releaseDate = releaseDate; }

    public String getPosterUrl(){
        return posterUrl;
    }
    public void setPosterUrl(String posterUrl){this.posterUrl = posterUrl;}

    public String getTrailerUrl(){return posterUrl;}
    public void setTrailerUrl(String trailerUrl){this.trailerUrl = trailerUrl;}

    
    public static MovieDTO fromEntity(Movie movie) {
        MovieDTO dto = new MovieDTO();
        
        dto.setId("tt" + String.format("%03d", movie.getId())); // Tạo mã "tt001"
        dto.setTitle(movie.getTitle());
        dto.setPosterUrl(movie.getPosterUrl());
        dto.setRating(movie.getRating() == null ? 0.0 : Double.valueOf(movie.getRating()));
        dto.setTrailerUrl(movie.getTrailerUrl());
        dto.setReleaseDate(movie.getReleaseDate());
        dto.setStatus(movie.getStatus().name());
        dto.setDurationMin(movie.getDurationMin());
        return dto;
    }
    
}
