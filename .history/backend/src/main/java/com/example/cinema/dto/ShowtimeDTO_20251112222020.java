package com.example.cinema.dto;

import java.util.*;

import com.example.cinema.repository.ShowTimeRepository;
public class ShowtimeDTO {
    private Long movieId ;
    private Long theaterId;
    private String date;
    private List<FormatDTO> formats = new ArrayList<>();
    
    public ShowtimeDTO(){}
    public ShowtimeDTO(Long movieId, Long theaterId, String date){
        this.movieId = movieId;
        this.theaterId = theaterId;
        this.date = date;
    }

    // inner class
    public static class FormatDTO {
        private String label;
        private String 
    }

    

}
