package com.example.cinema.dto;

import java.util.List;
import java.util.Map;

public class ShowtimeSeatMapResponse {

    // ===== SHOWTIME INFO =====
    private Long showtimeId;
    private String theaterName;
    private String showDate;      // yyyy-MM-dd
    private String startTime;     // HH:mm
    private String endTime;       // HH:mm
    private String formatName;

    // ===== MOVIE INFO =====
    private Long movieId;
    private String movieTitle;
    private Integer releaseYear;
    private Integer durationMin;
    private String posterUrl;
    private String trailerUrl;
    private List<String> genres;

    // ===== PRICING =====
    private Pricing pricing;
    public ShowtimeSeatMapResponse(){}

    public static class Pricing {
        private Map<String, ZonePrice> byZone;
    
        public Pricing(){}
        public Pricing(Map<String, ZonePrice> byZone) {
            this.byZone = byZone;
        }


        public Map<String, ZonePrice> getByZone() { return byZone; }
        public void setByZone(Map<String, ZonePrice> byZone) { this.byZone = byZone; }
    }

    public static class ZonePrice {
        private Double adult;
        private Double child;

        public ZonePrice(){}
        public ZonePrice(Double adult, Double child){
            this.adult = adult;
            this.child = child;
        }

        public Double getAdult() { return adult; }
        public void setAdult(Double adult) { this.adult = adult; }

        public Double getChild() { return child; }
        public void setChild(Double child) { this.child = child; }
    }

    // ===== GETTER / SETTER =====
    public Long getShowtimeId() { return showtimeId; }
    public void setShowtimeId(Long showtimeId) { this.showtimeId = showtimeId; }

    public String getTheaterName() { return theaterName; }
    public void setTheaterName(String theaterName) { this.theaterName = theaterName; }

    public String getShowDate() { return showDate; }
    public void setShowDate(String showDate) { this.showDate = showDate; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }
    
    public String getFormatName() { return formatName; }
    public void setFormatName(String formatName) { this.formatName = formatName; }

    public Long getMovieId() { return movieId; }
    public void setMovieId(Long movieId) { this.movieId = movieId; }

    public String getMovieTitle() { return movieTitle; }
    public void setMovieTitle(String movieTitle) { this.movieTitle = movieTitle; }

    public Integer getReleaseYear() { return releaseYear; }
    public void setReleaseYear(Integer releaseYear) { this.releaseYear = releaseYear; }

    public Integer getDurationMin() { return durationMin; }
    public void setDurationMin(Integer durationMin) { this.durationMin = durationMin; }

    public String getPosterUrl() { return posterUrl; }
    public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }

    public String getTrailerUrl() { return trailerUrl; }
    public void setTrailerUrl(String trailerUrl) { this.trailerUrl = trailerUrl; }

    public List<String> getGenres() { return genres; }
    public void setGenres(List<String> genres) { this.genres = genres; }

    public Pricing getPricing() { return pricing; }
    public void setPricing(Pricing pricing) { this.pricing = pricing; }
}
