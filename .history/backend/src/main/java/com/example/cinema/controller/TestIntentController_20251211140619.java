package com.example.cinema.controller;

import com.example.cinema.llm.IntentResult;
import com.example.cinema.llm.LLMService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/test-intent")
public class TestIntentController {

    private final LLMService llm;

    public TestIntentController(LLMService llm) {
        this.llm = llm;
    }

    @PostMapping
    public IntentResult testIntent(@RequestBody Map<String, String> body) {
        return llm.analyzeIntent(body.get("message"));
    }
}
