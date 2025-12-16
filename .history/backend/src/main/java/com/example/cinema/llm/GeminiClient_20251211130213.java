package com.example.cinema.llm;

import org.springframework.beans.factory.annotation.Value;

public class GeminiClient {
    @Value("${gemini.api.key}")
    private String apiKey;

    @
    private String model;
}
