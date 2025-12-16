package com.example.cinema.llm;

import org.springframework.beans.factory.annotation.Value;

public class GeminiClient {
    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.model}")
    private String model;

    rivate static final String API_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";
}
