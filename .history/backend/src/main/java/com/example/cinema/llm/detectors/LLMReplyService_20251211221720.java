package com.example.cinema.llm.detectors;

import org.springframework.stereotype.Service;

import com.example.cinema.llm.GroqClient;

@Service
public class LLMReplyService {
    private final GroqClient groq;
    public LLMReplyService(GroqClient groq) {
        this.groq = groq;
    }
    
}
