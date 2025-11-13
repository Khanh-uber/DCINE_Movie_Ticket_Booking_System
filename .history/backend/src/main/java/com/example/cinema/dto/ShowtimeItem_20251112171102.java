package com.example.cinema.dto;

public class ShowtimeItem {
    private String movieId;
    private String theaterId;
    private List<ShowtimeDate> dates ;
    public ShowtimeItem (){}
    
    public String getMovieId() {
        return movieId;
    }
    public void setMovieId(String movieId) {
        this.movieId = movieId;
    }

    public String getTheaterId() {
        return theaterId;
    }
    public void setTheaterId(String theaterId) {
        this.theaterId = theaterId;
    }

    public List<ShowtimeDate> getDates() {
        return dates;
    }
    public void setDates(List<ShowtimeDate> dates) {
        this.dates = dates;
    }
