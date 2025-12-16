package com.example.cinema.llm;

import java.util.List;

import lombok.Data;

@Data
public class IntentResult {

    private String intent;
    private Entities entities;

    @Data
    public static class Entities {
        private String movie;
        private List<String> genre;
        private String date;
        private String theater;
        private String time_phrase;
        
        private List<String> mood;
        private String location;
    }
}
