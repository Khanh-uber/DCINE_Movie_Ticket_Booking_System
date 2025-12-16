package com.example.cinema.dto;

public class ChatResponse {
    private String reply; // câu trả lời dạng text
    private Object data;  // dữ liệu kèm theo (nếu có)

    public ChatResponse(String reply) {
        this.reply = reply;
    }
    
    public ChatResponse(String reply, Object data) {
        this.reply = reply;
        this.data = data;
    }
    public 
}
