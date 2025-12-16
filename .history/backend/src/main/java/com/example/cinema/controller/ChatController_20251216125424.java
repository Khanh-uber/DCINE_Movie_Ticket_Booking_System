package com.example.cinema.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.cinema.dto.ChatRequest;
import com.example.cinema.dto.ChatResponse;
import com.example.cinema.service.ChatService;

import jakarta.servlet.http.HttpSession;


@RestController
@RequestMapping("/api/chatbot")
public class ChatController {
    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/ask")
    public ChatResponse chat(@RequestBody ChatRequest body, HttpSession session) {
        String message = body.getMessage();

        
        Long accountId = (Long) session.getAttribute("accountId");

        String memoryKey;
        if (accountId != null) {
            memoryKey = "acc:" + accountId;
        } else {
            memoryKey = "sess:" + session.getId();
        }

        return new ChatResponse("""
            <b>✅ Chatbot backend OK</b><br>
            Message: %s<br>
            MemoryKey: %s<br><br>
            <button class='btn-chat-action'>Test button</button>
        """.formatted(message, memoryKey));
    }
}
