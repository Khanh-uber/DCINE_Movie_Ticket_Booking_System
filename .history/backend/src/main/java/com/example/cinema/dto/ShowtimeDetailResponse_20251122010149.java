import  com.example.cinema.dto.*;

import java.util.List;
import java.util.Map;

public class ShowtimeDetailResponse {

    private Long showtimeId;
    private String theaterName;
    private String date;
    private String time;
    private String format;

    private MovieInfo movie;
    private Pricing pricing;


    public Long getShowtimeId() {
        return showtimeId;
    }

    public void setShowtimeId(Long showtimeId) {
        this.showtimeId = showtimeId;
    }

    public String getTheaterName() {
        return theaterName;
    }

    public void setTheaterName(String theaterName) {
        this.theaterName = theaterName;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    public MovieInfo getMovie() {
        return movie;
    }

    public void setMovie(MovieInfo movie) {
        this.movie = movie;
    }

    public Pricing getPricing() {
        return pricing;
    }

    public void setPricing(Pricing pricing) {
        this.pricing = pricing;
    }


    // ============================
    // ======== INNER CLASS ========
    // ============================

    // ========== MovieInfo ==========
    public static class MovieInfo {
        private Long id;
        private String title;
        private String posterUrl;
        private String trailerUrl;
        private String year;
        private List<String> genres;
        private Integer duration;

        // Getter & Setter
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getPosterUrl() { return posterUrl; }
        public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }

        public String getTrailerUrl() { return trailerUrl; }
        public void setTrailerUrl(String trailerUrl) { this.trailerUrl = trailerUrl; }

        public String getYear() { return year; }
        public void setYear(String year) { this.year = year; }

        public List<String> getGenres() { return genres; }
        public void setGenres(List<String> genres) { this.genres = genres; }

        public Integer getDuration() { return duration; }
        public void setDuration(Integer duration) { this.duration = duration; }
    }


    // ========== Pricing ==========

    public static class Pricing {
        private Map<String, ZonePrice> byZone;

        public Map<String, ZonePrice> getByZone() {
            return byZone;
        }

        public void setByZone(Map<String, ZonePrice> byZone) {
            this.byZone = byZone;
        }
    }


    // ========== ZonePrice ==========

    public static class ZonePrice {
        private Integer adult;
        private Integer child;

        public Integer getAdult() { return adult; }
        public void setAdult(Integer adult) { this.adult = adult; }

        public Integer getChild() { return child; }
        public void setChild(Integer child) { this.child = child; }
    }
}
