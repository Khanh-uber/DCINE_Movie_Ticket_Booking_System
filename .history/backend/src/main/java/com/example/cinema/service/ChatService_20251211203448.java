package com.example.cinema.service;

import org.springframework.stereotype.Service;

import com.example.cinema.dto.ChatResponse;
import com.example.cinema.llm.GroqClient;

@Service
public class ChatService {
    private final GroqClient groq;                // phân tích intent/entity
    private final ShowtimeService showtimeService;
    private final MovieService movieService;

    public ChatService(GroqClient groq, ShowtimeService showtimeService, MovieService movieService) {
        this.groq = groq;
        this.showtimeService = showtimeService;
        this.movieService = movieService;
    }
    public ChatResponse handleMessage(String )
}
