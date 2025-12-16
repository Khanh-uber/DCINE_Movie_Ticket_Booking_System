package com.example.cinema.service;

import org.springframework.stereotype.Service;

import com.example.cinema.dto.ChatResponse;
import com.example.cinema.dto.IntentResult;
import com.example.cinema.llm.LLMService;

@Service
public class ChatService {
    private final LLMService llmService;                // phân tích intent/entity
    private final ShowtimeService showtimeService;
    private final MovieService movieService;

    public ChatService(LLMService llmService, ShowtimeService showtimeService, MovieService movieService) {
        this.llmService = llmService;
        this.showtimeService = showtimeService;
        this.movieService = movieService;
    }
    public ChatResponse handleMessage(String message) {
        // 1) ⭐ PHÂN TÍCH INTENT + ENTITY QUA GROQ LLM
        IntentResult intentResult = llmService.analyzeIntent(message);

        // 2) XỬ LÝ LOGIC THEO INTENT + ENTITY

        // 3) TỔNG HỢP VÀ TRẢ VỀ KẾT QUẢ

        return new ChatResponse();
    }
}
