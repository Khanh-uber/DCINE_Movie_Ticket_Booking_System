package com.example.cinema.dto;

import java.util.Map;

public class ChatRequest {
    public String message;
    public Map<String, Object> context;

    public ChatRequest(String message, Map<String, Object> ctx){
        this.message = message;
    }
}
