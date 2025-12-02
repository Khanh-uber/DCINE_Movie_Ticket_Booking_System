package com.example.cinema.socket;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value; 
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class SocketService {

    private final RestTemplate restTemplate;

    @Value("${socket.emit.url}")
    private String socketEmitUrl;

    public SocketService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public void emitPaymentSuccess(Map<String, Object> payload) {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> req = new HttpEntity<>(payload, headers);

        try {
            restTemplate.postForEntity(socketEmitUrl, req, String.class);
        } catch (Exception e) {
            System.out.println("Emit socket lỗi: " + e.getMessage());
        }
    }
}