package com.example.cinema.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.cinema.llm.GeminiClient;

@RestController
public class TestGroqController {
    private final GeminiClient gemini;
    public TestGroqController(GeminiClient gemini) {
        this.gemini = gemini;
    }

    @GetMapping("/test-gemini")
    public String testGemini() {
        return gemini.generate("Xin chao ban la ai?");
    }
}
