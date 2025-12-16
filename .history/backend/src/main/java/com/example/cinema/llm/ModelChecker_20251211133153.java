package com.example.cinema.llm;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ModelChecker {

    @Value("${gemini.api.key}")
    private String apiKey;

    OkHttpClient client = new OkHttpClient();

    public String listModels() {
        try {
            String url = "https://generativelanguage.googleapis.com/v1/models?key=" + apiKey;

            Request request = new Request.Builder()
                    .url(url)
                    .get()
                    .build();

            Response response = client.newCall(request).execute();
            return response.body().string();

        } catch (Exception e) {
            return "Error listing models: " + e.getMessage();
        }
    }
}
