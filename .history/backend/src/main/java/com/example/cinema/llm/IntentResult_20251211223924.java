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
        private List genre;
        private String date;
        private String theater;
        private String time;
        private String mood;
        private String location;
    }
}
