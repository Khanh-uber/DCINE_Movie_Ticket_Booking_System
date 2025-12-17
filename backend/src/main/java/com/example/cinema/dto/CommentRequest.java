package com.example.cinema.dto;

import lombok.Data;

@Data
public class CommentRequest {
    private Long movieId;
    private String content;
}