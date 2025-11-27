package com.example.cinema.dto;

import com.example.cinema.entity.Movie;
import com.example.cinema.entity.Movie.MovieStatus;

import java.time.LocalDate;
import java.util.List;

public class MovieDTO {
    private Long id;
    private String title;
    private String posterUrl;
    private String trailerUrl;
    private Double rating;
    private LocalDate releaseDate;
    private Integer durationMin;
    private String rated;
    private String bannerUrl;
    private List<String> genres;
    private String language;
    //private List<String> cast;
    //private List<String> director;
    private String synopsis;
    private String originalTitle;
    private String href;
    private MovieStatus status;
    
    private List<CastDTO> cast;

    public List<CastDTO> getCast() { return cast; }
    public void setCast(List<CastDTO> cast) { this.cast = cast; }

    private List<CastDTO> director;

    public List<CastDTO> getDirector() { return director; }
    public void setDirector(List<CastDTO> director) { this.director = director; }


    // 
    public MovieDTO() {}

    public MovieDTO (Long Id, String title, String posterUrl, String trailerUrl, Double rating, LocalDate releaseDate, Integer duration_min){
        this.id = Id;
        this.title = title;
        this.trailerUrl = trailerUrl;
        this.posterUrl = posterUrl;
        this.rating = rating;
        this.releaseDate = releaseDate;
        this.durationMin = duration_min;
    }
    
    // ✅ Getter + Setter cho tất cả field
    public String getRated(){return rated;}
    public void setRated(String rated){this.rated = rated;}

    public String getBannerUrl() { return bannerUrl; }
    public void setBannerUrl(String bannerUrl) { this.bannerUrl = bannerUrl; }

    public List<String> getGenres(){return genres;}
    public void setGenres(List<String> genres){this.genres = genres;}

    public String getLanguage(){return language;}
    public void setLanguage(String language){this.language = language;}

    // public List<String> getCast(){return cast;}
    // public void setCast(List<String> cast){this.cast = cast;}

    //public List<String> getDirector(){return director;}
    //public void setDirector(List<String> director){this.director = director;}
    
    public String getOriginalTitle(){return originalTitle;}
    public void setOriginalTitle(String originalTitle){this.originalTitle = originalTitle;}

    public String getHref(){return href;}
    public void setHref(String href){this.href = href;}

    public Long getId(){return id;}
    public void setId(Long id){this.id = id;}


    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSynopsis() { return synopsis; }
    public void setSynopsis(String synopsis) { this.synopsis = synopsis; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getDurationMin() { return durationMin; }
    public void setDurationMin(Integer durationMin) { this.durationMin = durationMin; }

    public LocalDate getReleaseDate() { return releaseDate; }
    public void setReleaseDate(LocalDate releaseDate) { this.releaseDate = releaseDate; }

    public String getPosterUrl(){ return posterUrl; }
    public void setPosterUrl(String posterUrl){this.posterUrl = posterUrl;}

    public String getTrailerUrl(){return trailerUrl;}
    public void setTrailerUrl(String trailerUrl){this.trailerUrl = trailerUrl;}
    
    public MovieStatus getStatus(){return status;}
    public void setStatus(MovieStatus status){this.status = status;}
    
    
    public static MovieDTO fromEntity(Movie movie) {
        MovieDTO dto = new MovieDTO();
        String rated = "";
        String value = movie.getRated();

        if (value != null && !value.isBlank()) {
            rated = value.substring(0, 3);
        }

        dto.setRated(rated);
        dto.setBannerUrl(movie.getBannerUrl());
        dto.setLanguage(movie.getLanguage());
        dto.setId(movie.getId()); // Tạo mã "tt001"
        dto.setTitle(movie.getTitle());
        dto.setSynopsis(movie.getSynopsis());
        dto.setPosterUrl(movie.getPosterUrl());
        dto.setRating(movie.getRating() == null ? 0.0 : Double.valueOf(movie.getRating()));
        dto.setTrailerUrl(movie.getTrailerUrl());
        dto.setReleaseDate(movie.getReleaseDate());
        dto.setDurationMin(movie.getDurationMin());
        dto.setOriginalTitle(movie.getOriginalTitle());
        dto.setHref("showtime.html?movie="+movie.getId());
        dto.setStatus(movie.getStatus());
        return dto;
    }
    
}
