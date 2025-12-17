package com.example.cinema.service;

import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.cinema.dto.FaissContextResponse;

@Service
public class FaissClientService {
    private final RestTemplate restTemplate = new RestTemplate();
    private static final String FAISS_URL =
        "http://localhost:8000/faiss/context";

    public FaissContextResponse getContext(String query) {
        Map <String, Object> req = Map.of(
            "query", query,
            "top_k", 3,
            "score_threshold", 0.75
        );

        return restTemplate.postForObject(
            FAISS_URL,
            req,
            FaissContextResponse.class
        );
    }
}
