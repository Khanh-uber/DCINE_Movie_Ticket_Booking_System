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
                                this.
                            }
}

