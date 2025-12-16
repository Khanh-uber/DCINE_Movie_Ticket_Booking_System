package com.example.cinema.dto;

public class ChatResponse {
    private String reply; // câu trả lời dạng text
    private Object data;  // dữ liệu kèm theo (nếu có)

    public ChatResponse() {}
    public 
    public ChatResponse(String reply, Object data) {
        this.reply = reply;
        this.data = data;
    }
    public ChatResponse(Object data) {
        this.data = data;
    }
    public String getReply() {
        return reply;
    }
    public void setReply(String reply) {
        this.reply = reply;
    }
    public Object getData() {
        return data;
    }
    public void setData(Object data) {
        this.data = data;
    }
}
