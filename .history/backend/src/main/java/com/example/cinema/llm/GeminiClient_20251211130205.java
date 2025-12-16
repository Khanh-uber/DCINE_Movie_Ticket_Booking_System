package com.example.cinema.llm;

import org.springframework.beans.factory.annotation.Value;

public class GeminiClient {
    @Value
    private String apiKey;
    private String model;
}
