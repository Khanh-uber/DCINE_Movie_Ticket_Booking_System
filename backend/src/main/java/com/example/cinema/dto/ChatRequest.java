package com.example.cinema.dto;

import java.util.Map;

public class ChatRequest {
    public String user_message;
    public Map<String, Object> context;

    public ChatRequest(){}
    public ChatRequest(String message, Map<String, Object> ctx){
        this.user_message = message;
        this.context = ctx;
    }
    public String getUser_message(){return user_message;}
    public void setUser_message(String message){this.user_message = message;}

    public Map<String, Object> getContext(){return context;}
    public void setContext(Map<String, Object> ctx){this.context = ctx;}
}
