package com.example.cinema.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.cinema.dto.ChatResponse;
import com.example.cinema.service.ChatService;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ChatResponse chat(@RequestBody Map<String, String> body) {
        String message = body.get("message");
        return chatService.handleMessage(message);
    }
}
