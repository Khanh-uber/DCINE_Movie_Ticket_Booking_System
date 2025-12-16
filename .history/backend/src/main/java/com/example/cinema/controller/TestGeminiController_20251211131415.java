package com.example.cinema.controller;

import org.springframework.web.bind.annotation.RestController;

import com.example.cinema.llm.GeminiClient;

@RestController
public class TestGeminiController {
    private final GeminiClient gemini;
    public TestGeminiController(GeminiClient gemini) {
        this.gemini = gemini;
    }

    
}
