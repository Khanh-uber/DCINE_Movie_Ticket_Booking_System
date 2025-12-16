package com.example.cinema.service;

import org.springframework.stereotype.Service;

import com.example.cinema.llm.GroqClient;

@Service
public class ChatService {
     private final GroqClient groq;                // phân tích intent/entity
    private final ShowtimeService showtimeService;
    private final MovieService movieService;
}
