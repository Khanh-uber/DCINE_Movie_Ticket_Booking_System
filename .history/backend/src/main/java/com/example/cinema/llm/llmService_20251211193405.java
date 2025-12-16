package com.example.cinema.llm;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

@Service
public class LLMService {

    private final GroqClient groq;
    private final ObjectMapper mapper = new ObjectMapper();
    private final Ner
    public LLMService(GroqClient groq) {
        this.groq = groq;
    }

    public IntentResult analyzeIntent(String message) {

        try {
            String prompt = PromptTemplates.INTENT_PROMPT + "\nUser: " + message;

            // Gọi Groq LLM
            String rawJson = groq.generate(prompt);

            System.out.println("\n=== RAW INTENT JSON ===\n" + rawJson + "\n");

            // Parse JSON trả về thành DTO
            IntentResult result = mapper.readValue(rawJson, IntentResult.class);
            return result;

        } catch (Exception e) {
            System.out.println("❌ Intent parse error: " + e.getMessage());

            IntentResult fallback = new IntentResult();
            fallback.setIntent("unknown");
            fallback.setEntities(new IntentResult.Entities());
            return fallback;
        }
    }
}
