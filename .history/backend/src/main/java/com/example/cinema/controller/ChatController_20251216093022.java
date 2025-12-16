package com.example.cinema.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.cinema.dto.ChatResponse;
import com.example.cinema.service.ChatService;

import jakarta.servlet.http.HttpSession;

import java.util.Map;
@RestController
@RequestMapping("/api/chat")
public class ChatController {
    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ChatResponse chat(@RequestBody Map<String, String> body, HttpSession session) {
        String message = body.get("message");

        Long accountId = (Long) session.getAttribute("accountId");

        String memoryKey;
        if (accountId != null) {
            memoryKey = "acc:" + accountId;
        } else {
            memoryKey = "sess:" + session.getId();
        }

        return chatService.handleMessage(message, memoryKey);
    }
}
