package com.example.cinema.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.cinema.llm.GroqClient;

@RestController
public class TestGroqController {

    private final GroqClient groq;

    public TestGroqController(GroqClient groq) {
        this.groq = groq;
    }

    @GetMapping("/test-groq")
    public String test() {
        return groq.generate("Xin chào, bạn là ai?");
    }
}

