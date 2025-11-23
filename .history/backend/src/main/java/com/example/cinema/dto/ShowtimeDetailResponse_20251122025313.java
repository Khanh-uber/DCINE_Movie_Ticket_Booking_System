package com.example.cinema.dto;

import java.util.List;
import java.util.Map;

public class ShowtimeDetailResponse {

    private ShowtimeInfo showtime;
    private MovieInfo movie;
    private TheaterInfo theater;
    private Pricing pricing;

    // ===== Constructors =====
    public ShowtimeDetailResponse() {}

    public ShowtimeDetailResponse(ShowtimeInfo showtime, MovieInfo movie, TheaterInfo theater, Pricing pricing) {
        this.showtime = showtime;
        this.movie = movie;
        this.theater = theater;
        this.pricing = pricing;
    }

    // ===== Getters / Setters =====
    public ShowtimeInfo getShowtime() { return showtime; }
    public void setShowtime(ShowtimeInfo showtime) { this.showtime = showtime; }

    public MovieInfo getMovie() { return movie; }
    public void setMovie(MovieInfo movie) { this.movie = movie; }

    public TheaterInfo getTheater() { return theater; }
    public void setTheater(TheaterInfo theater) { this.theater = theater; }

    public Pricing getPricing() { return pricing; }
    public void setPricing(Pricing pricing) { this.pricing = pricing; }

    
    // 1) Showtime DTO

    public static class ShowtimeInfo {
        private Long id;
        private String theaterName;
        private String date;
        private String time;
        private String format;

        public ShowtimeInfo() {}

        public ShowtimeInfo(Long id, String theaterName, String date, String time, String format) {
            this.id = id;
            this.theaterName = theaterName;
            this.date = date;
            this.time = time;
            this.format = format;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getTheaterName() { return theaterName; }
        public void setTheaterName(String theaterName) { this.theaterName = theaterName; }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }

        public String getTime() { return time; }
        public void setTime(String time) { this.time = time; }

        public String getFormat() { return format; }
        public void setFormat(String format) { this.format = format; }
    }

    // =======================================================
    // 2) Movie DTO
    // =======================================================
    public static class MovieInfo {
        private String id;
        private String title;
        private String posterUrl;
        private String trailerUrl;
        private String releaseDate;
        private Integer duration;
        private List<String> genres;

        public MovieInfo() {}

        public MovieInfo(String id, String title, String posterUrl, String trailerUrl,
                         String releaseDate, Integer duration, List<String> genres) {
            this.id = id;
            this.title = title;
            this.posterUrl = posterUrl;
            this.trailerUrl = trailerUrl;
            this.releaseDate = releaseDate;
            this.duration = duration;
            this.genres = genres;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getPosterUrl() { return posterUrl; }
        public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }

        public String getTrailerUrl() { return trailerUrl; }
        public void setTrailerUrl(String trailerUrl) { this.trailerUrl = trailerUrl; }

        public String getReleaseDate() { return releaseDate; }
        public void setReleaseDate(String releaseDate) { this.releaseDate = releaseDate; }

        public Integer getDuration() { return duration; }
        public void setDuration(Integer duration) { this.duration = duration; }

        public List<String> getGenres() { return genres; }
        public void setGenres(List<String> genres) { this.genres = genres; }
    }

    // =======================================================
    // 3) Theater DTO
    // =======================================================
    public static class TheaterInfo {
        private String id;
        private String name;

        public TheaterInfo() {}

        public TheaterInfo(String id, String name) {
            this.id = id;
            this.name = name;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    // =======================================================
    // 4) Pricing DTO
    // =======================================================
    public static class Pricing {
        private Map<String, PriceItem> byZone;

        public Pricing() {}

        public Pricing(Map<String, PriceItem> byZone) {
            this.byZone = byZone;
        }

        public Map<String, PriceItem> getByZone() { return byZone; }
        public void setByZone(Map<String, PriceItem> byZone) { this.byZone = byZone; }
    }

    public static class PriceItem {
        private Integer adult;
        private Integer child;

        public PriceItem() {}

        public PriceItem(Integer adult, Integer child) {
            this.adult = adult;
            this.child = child;
        }

        public Integer getAdult() { return adult; }
        public void setAdult(Integer adult) { this.adult = adult; }

        public Integer getChild() { return child; }
        public void setChild(Integer child) { this.child = child; }
    }
}
