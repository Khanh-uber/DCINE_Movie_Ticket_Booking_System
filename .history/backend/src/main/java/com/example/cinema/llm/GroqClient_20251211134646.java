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

    @Value("${gemini.model}")
    private String model;

    private static final String API_URL =
        "https://generativelanguage.googleapis.com/v1/models/%s:generateContent?key=%s";

    private final OkHttpClient client = new OkHttpClient();
    private final ObjectMapper mapper = new ObjectMapper();

    public String generate(String prompt) {
        try {
            // 1) Build URL
            String url = API_URL.formatted(model, apiKey);

            // 2) Build JSON body
            String safePrompt = prompt.replace("\"", "\\\"");
            String jsonBody = """
            {
              "contents": [
                {
                  "parts": [
                    { "text": "%s" }
                  ]
                }
              ]
            }
            """.formatted(safePrompt);

            // 3) Build HTTP request
            Request request = new Request.Builder()
                    .url(url)
                    .post(RequestBody.create(
                            jsonBody,
                            MediaType.get("application/json")))
                    .build();

            // 4) Execute API call
            Response response = client.newCall(request).execute();
            String body = response.body().string();

            // DEBUG (quan trọng)
            System.out.println("\n=== GEMINI RAW RESPONSE ===\n" + body + "\n");

            // Parse JSON
            JsonNode root = mapper.readTree(body);

            // 5) Handle API error
            if (root.has("error")) {
                return "Gemini Error: " + root.get("error").get("message").asText();
            }

            // 6) Check candidates exist
            if (!root.has("candidates") || root.get("candidates").isEmpty()) {
                return "Gemini Error: No candidates returned.";
            }

            // 7) Extract text safely
            return root
                    .get("candidates").get(0)
                    .get("content")
                    .get("parts").get(0)
                    .get("text")
                    .asText();

        } catch (Exception e) {
            return "Error calling Gemini: " + e.getMessage();
        }
    }
}
