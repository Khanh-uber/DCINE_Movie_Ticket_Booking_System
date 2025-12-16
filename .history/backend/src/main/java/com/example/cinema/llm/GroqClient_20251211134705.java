package com.example.cinema.llm;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

@Service
public class GroqClient {

    @Value("${groq.api.key}")
    private String apiKey;

    // Model tốt nhất: LLaMA 3.1 8B hoặc 70B
    @Value("${groq.model}")
    private String model;

    private static final String API_URL = "https://api.groq.com/openai/v1/chat/completions";

    private final OkHttpClient client = new OkHttpClient();
    private final ObjectMapper mapper = new ObjectMapper();

    public String generate(String prompt) {
        try {
            String jsonBody = """
            {
              "model": "%s",
              "messages": [
                {
                  "role": "user",
                  "content": "%s"
                }
              ]
            }
            """.formatted(model, prompt.replace("\"", "\\\""));

            Request request = new Request.Builder()
                    .url(API_URL)
                    .post(RequestBody.create(
                            jsonBody,
                            MediaType.get("application/json")
                    ))
                    .addHeader("Authorization", "Bearer " + apiKey)
                    .build();

            Response response = client.newCall(request).execute();
            String body = response.body().string();

            System.out.println("\n=== GROQ RAW RESPONSE ===\n" + body + "\n");

            JsonNode root = mapper.readTree(body);

            if (root.has("error")) {
                return "Groq Error: " + root.get("error").get("message").asText();
            }

            return root
                    .get("choices")
                    .get(0)
                    .get("message")
                    .get("content")
                    .asText();

        } catch (Exception e) {
            return "Error calling Groq: " + e.getMessage();
        }
    }
}
