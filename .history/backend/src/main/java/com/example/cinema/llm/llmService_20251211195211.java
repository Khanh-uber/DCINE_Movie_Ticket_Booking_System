package com.example.cinema.llm;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

@Service
public class LLMService {

    private final GroqClient groq;
    private final ObjectMapper mapper = new ObjectMapper();
    private final NERPipeline nerPipeline;
    public LLMService(GroqClient groq, NERPipeline nerPipeline) {
        this.groq = groq;
        this.nerPipeline = nerPipeline;
    }

    public IntentResult analyzeIntent(String message) {
        IntentResult result;
        try {
            String prompt = PromptTemplates.INTENT_PROMPT + "\nUser: " + message;

            // Gọi Groq LLM
            String rawJson = groq.generate(prompt);

            System.out.println("\n=== RAW INTENT JSON ===\n" + rawJson + "\n");

            // Parse JSON trả về thành DTO
            result = mapper.readValue(rawJson, IntentResult.class);
            return result;
        } catch (Exception e) {
            System.out.println("Intent parse error: " + e.getMessage());

            IntentResult fallback = new IntentResult();
            fallback.setIntent("unknown");
            fallback.setEntities(new IntentResult.Entities());
            return fallback;
        }
         // 3) ⭐ TRẢ KẾT QUẢ QUA NER PIPELINE (3 tầng)
    //     IntentResult finalIntent = nerPipeline.correct(result, message);

    //     System.out.println("=== FINAL INTENT ===");
    //     System.out.println("Intent : " + finalIntent.getIntent());
    //     System.out.println("Movie  : " + finalIntent.getEntities().getMovie());
    //     System.out.println("Date   : " + finalIntent.getEntities().getDate());
    //     System.out.println("Loc    : " + finalIntent.getEntities().getLocation());

    //     return finalIntent;
    // }
}
