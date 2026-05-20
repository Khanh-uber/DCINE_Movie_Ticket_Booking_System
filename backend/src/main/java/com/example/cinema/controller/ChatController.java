package com.example.cinema.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.example.cinema.dto.ChatRequest;
import com.example.cinema.dto.ChatResponse;
import org.springframework.http.*;
import jakarta.servlet.http.HttpSession;

import java.util.*;

@RestController
@RequestMapping("/api/chatbot")
public class ChatController {
    private final String PYTHON_AGENT_URL = "http://127.0.0.1:8000/api/chat";
    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/ask")
    public ResponseEntity<?> chat(@RequestBody ChatRequest body, HttpSession session) {
        try {
            String userMessage = body.getUser_message();
            if (userMessage == null || userMessage.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ChatResponse("Bạn chưa nhập câu hỏi ...", null, null, null));
            }
            
            List<Map<String, Object>> chatHistory = (List<Map<String, Object>>) session.getAttribute("CHAT_HISTORY");
            if (chatHistory == null) {
                chatHistory = new ArrayList<>();
            }
            String summaryContext = (String) session.getAttribute("SUMMARY_CONTEXT");
            if (summaryContext == null) {
                summaryContext = "";
            }


            // BƯỚC 2: GÓI PAYLOAD GỬI SANG PYTHON FASTAPI (PORT 8000)
            Map<String, Object> pythonRequest = new HashMap<>();
            pythonRequest.put("user_message", userMessage);
            pythonRequest.put("chat_history", chatHistory);
            pythonRequest.put("summary_context", summaryContext);
            

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(pythonRequest, headers);
            
            System.out.println("\n=== [DEBUG REQUEST TO PYTHON] ===");
            System.out.println("Session ID: " + session.getId());
            System.out.println("User message: " + userMessage);
            System.out.println("Chat history size: " + chatHistory.size());
            System.out.println("Chat history: " + chatHistory);
            System.out.println("Summary context: " + summaryContext);
            System.out.println("=================================\n");

            ResponseEntity<Map> response = restTemplate.postForEntity(PYTHON_AGENT_URL, entity, Map.class);
            Map<String, Object> pythonResponse = response.getBody();


            if (pythonResponse != null && "success".equals(pythonResponse.get("status"))) {
                session.setAttribute("CHAT_HISTORY", pythonResponse.get("updated_history"));
                session.setAttribute("SUMMARY_CONTEXT", pythonResponse.get("summary_context"));

                String botMessage = (String) pythonResponse.get("bot_message");
                String action = (String) pythonResponse.get("action");
                Long showtimeId = null;

                if (pythonResponse.get("showtime_id") != null) {
                    showtimeId = Long.valueOf(pythonResponse.get("showtime_id").toString());
                }
                List<Object> frontendData = (List<Object>) pythonResponse.get("frontend_data");
                System.out.println("=== [DEBUG JAVA] ĐÓNG GÓI CHAT_RESPONSE ===");
                System.out.println("👉 Action điều hướng: " + action);
                System.out.println("👉 Mảng data phim gửi về HTML: " + (frontendData != null ? frontendData.size() + " phim" : "null"));
                System.out.println("===========================================\n");
                ChatResponse finalResponse = new ChatResponse(botMessage, action, showtimeId, frontendData);
                return ResponseEntity.ok(finalResponse);
            }
            throw new RuntimeException("Python Agent phản hồi thất bại.");
        }
        catch (Exception e) {
            System.err.println("[SPRING PROXY ERROR]: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ChatResponse("⚠️ Hệ thống AI đang bảo trì nốt vài giây, Thức đợi em tí nha chớ!", null, null, null));
        }
    }
}
