package com.example.cinema.llm;

import org.springframework.beans.factory.annotation.Value;

import com.fasterxml.jackson.databind.ObjectMapper;

import okhttp3.OkHttpClient;
import okhttp3.Request;

public class GeminiClient {
    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.model}")
    private String model;

    private static final String API_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";
    private final OkHttpClient client = new OkHttpClient();
    private final ObjectMapper mapper = new ObjectMapper();

    public String generate(String prompt){
        try {
            // build request url
            String url = API_URL.formatted(model, apiKey);

            // Build Json body
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
        """.formatted(prompt.replace("\"", "\\\""));
         // Build HTTP request
        Request request = new Request.Builder()
                .url(url)
                .post(RequestBody.create(
                        jsonBody,
                        MediaType.get("application/json")
                ))
                .build();
        }
        
    }
}
