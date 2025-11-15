package com.example.cinema.dto;

import java.math.BigDecimal;

public class ShowtimeFlatDTO {
    private Long id;
    private Long movieId;
    private Long theaterId;
    private String date;
    private String time;
    private String format;
    private String language;
    private String room;
    private BigDecimal price;
    
    public ShowtimeFlatDTO(){}

    public ShowtimeFlatDTO(Long id, Long movieId, Long theaterId, String date, String time, String format, String language, String
                            room, BigDecimal price ){
                                this.id = id;
                                this.movieId = movieId;
                                this.theaterId = theaterId;
                                this.date = date;
                                this.time = time;
                                this.format = format;
                                this.language = language;
                                this.room = room;
                                this.price = price;
                            }
    public static ShowtimeFlatDTO fromEntity(Showtime s){
        
    }
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getMovieId() {
        return movieId;
    }

    public void setMovieId(Long movieId) {
        this.movieId = movieId;
    }

    public Long getTheaterId() {
        return theaterId;
    }

    public void setTheaterId(Long theaterId) {
        this.theaterId = theaterId;
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

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getRoom() {
        return room;
    }

    public void setRoom(String room) {
        this.room = room;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }
}

