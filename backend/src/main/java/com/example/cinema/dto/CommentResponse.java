package com.example.cinema.dto;

import lombok.Data;

@Data
public class CommentResponse {
    private Long id;
    private String content;
    private String createdAt; 
    private String fullName;
    private String avatarUrl;
    private boolean myComment;
}