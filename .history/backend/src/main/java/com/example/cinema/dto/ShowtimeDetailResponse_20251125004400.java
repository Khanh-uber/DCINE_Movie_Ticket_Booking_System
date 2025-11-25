package com.example.cinema.dto;

import java.util.List;
import java.util.Map;

import com.example.cinema.entity.Showtime;

public class ShowtimeDetailResponse {

    private ShowtimeInfo showtime;
    private Theater theater;
    private Movie movie;
    private Pricing pricing;
    // private Long showtimeId;
    // ===== Constructor =====
    public ShowtimeDetailResponse() {}

    // ===== Getters & Setters =====
    public ShowtimeInfo getShowtime(){return showtime;}
    public void setShowtime(ShowtimeInfo showtime){this.showtime = showtime;}

    public Theater getTheater() { return theater; }
    public void setTheater(Theater theater) { this.theater = theater; }

    // public Long getShowtimeId(){return showtimeId;}
    // public void setShowtimeId(Long showtimeId){this.showtimeId = showtimeId;}


    public Movie getMovie() { return movie; }
    public void setMovie(Movie movie) { this.movie = movie; }

    public Pricing getPricing() { return pricing; }
    public void setPricing(Pricing pricing) { this.pricing = pricing; }

    public static class ShowtimeInfo {
        private Long id;
        private String theaterName;
        private String date;
        private String time;
        private String format;

        public ShowtimeInfo() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTheaterName() { return theaterName; }
        public void setTheaterName(String theaterName) { this.theaterName = theaterName; }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }

        public String getTime() { return time; }
        public void setTime(String time) { this.time = time; }

        public String getFormat() { return format; }
        public void setFormat(String format) { this.format = format; }
    }
    // =====================================================
    // THEATER DTO
    // =====================================================
    public static class Theater {
        private Long id;
        private String name;

        public Theater() {}

        public Theater(Long id, String name) {
            this.id = id;
            this.name = name;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    // =====================================================
    // MOVIE DTO
    // =====================================================
    public static class Movie {
        private Long id;
        private String title;
        private String originalTitle;
        private String posterUrl;
        private String backdropUrl;
        private String trailerUrl;

        private Double rating;
        private String rated;
        private Integer duration;

        private List<String> genres;
        private String language;
        private String releaseDate;
        private String synopsis;

        private String director;
        private List<String> cast;

        public Movie() {}

        // Getters & Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getOriginalTitle() { return originalTitle; }
        public void setOriginalTitle(String originalTitle) { this.originalTitle = originalTitle; }

        public String getPosterUrl() { return posterUrl; }
        public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }

        public String getBackdropUrl() { return backdropUrl; }
        public void setBackdropUrl(String backdropUrl) { this.backdropUrl = backdropUrl; }

        public String getTrailerUrl() { return trailerUrl; }
        public void setTrailerUrl(String trailerUrl) { this.trailerUrl = trailerUrl; }

        public Double getRating() { return rating; }
        public void setRating(Double rating) { this.rating = rating; }

        public String getRated() { return rated; }
        public void setRated(String rated) { this.rated = rated; }

        public Integer getDuration() { return duration; }
        public void setDuration(Integer duration) { this.duration = duration; }

        public List<String> getGenres() { return genres; }
        public void setGenres(List<String> genres) { this.genres = genres; }

        public String getLanguage() { return language; }
        public void setLanguage(String language) { this.language = language; }

        public String getReleaseDate() { return releaseDate; }
        public void setReleaseDate(String releaseDate) { this.releaseDate = releaseDate; }

        public String getSynopsis() { return synopsis; }
        public void setSynopsis(String synopsis) { this.synopsis = synopsis; }

        public String getDirector() { return director; }
        public void setDirector(String director) { this.director = director; }

        public List<String> getCast() { return cast; }
        public void setCast(List<String> cast) { this.cast = cast; }
    }

    // =====================================================
    // PRICING DTO
    // =====================================================
    public static class Pricing {
        private Map<String, Price> byZone;

        public Pricing() {}

        public Pricing(Map<String, Price> byZone) {
            this.byZone = byZone;
        }

        public Map<String, Price> getByZone() { return byZone; }
        public void setByZone(Map<String, Price> byZone) { this.byZone = byZone; }
    }

    public static class Price {
        private Integer adult;
        private Integer child;

        public Price() {}

        public Price(Integer adult, Integer child) {
            this.adult = adult;
            this.child = child;
        }

        public Integer getAdult() { return adult; }
        public void setAdult(Integer adult) { this.adult = adult; }

        public Integer getChild() { return child; }
        public void setChild(Integer child) { this.child = child; }
    }
}
