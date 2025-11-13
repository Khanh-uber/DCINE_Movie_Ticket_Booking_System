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
        private String lang;
        private List<String> times = new ArrayList<>();

        public FormatDTO(){}
        public FormatDTO(String label, String lang){
            this.label = label;
            this.lang = lang;
        }

        public String getLabel(){return label;}
        public void setLabel(String label){this.label = label;}
        
        public String getLang(){return lang;}
        public void setLang(String lang){this.lang = lang;}

        public List<String> getTimes()
    }

    

}
