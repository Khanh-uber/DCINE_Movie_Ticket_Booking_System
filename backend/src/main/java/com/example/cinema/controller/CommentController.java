package com.example.cinema.controller;

import com.example.cinema.dto.CommentRequest;
import com.example.cinema.dto.CommentResponse;
import com.example.cinema.service.CommentService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/comments")
    public ResponseEntity<List<CommentResponse>> getComments(@RequestParam Long movieId, HttpSession session) {
        Long currentUserId = (Long) session.getAttribute("accountId");
        return ResponseEntity.ok(commentService.getCommentsByMovie(movieId, currentUserId));
    }
    @DeleteMapping("/comments/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable Long id, HttpSession session) {
        Long accountId = (Long) session.getAttribute("accountId");
        if (accountId == null) return ResponseEntity.status(401).body(Map.of("error", "Vui lòng đăng nhập"));

        try {
            commentService.deleteComment(accountId, id);
            return ResponseEntity.ok(Map.of("message", "Xóa thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    @PutMapping("/comments/{id}")
    public ResponseEntity<?> updateComment(@PathVariable Long id, @RequestBody CommentRequest request, HttpSession session) {
        Long accountId = (Long) session.getAttribute("accountId");
        if (accountId == null) return ResponseEntity.status(401).body(Map.of("error", "Vui lòng đăng nhập"));

        try {
            commentService.updateComment(accountId, id, request.getContent());
            return ResponseEntity.ok(Map.of("message", "Sửa thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/comments")
    public ResponseEntity<?> createComment(@RequestBody CommentRequest request, HttpSession session) {
        Long accountId = (Long) session.getAttribute("accountId");
        
        if (accountId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Vui lòng đăng nhập để bình luận"));
        }

        try {
            commentService.addComment(accountId, request);
            return ResponseEntity.ok(Map.of("message", "Đăng bình luận thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}