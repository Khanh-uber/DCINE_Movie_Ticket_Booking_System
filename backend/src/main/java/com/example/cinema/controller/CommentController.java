package com.example.cinema.controller;

import com.example.cinema.dto.CommentRequest;
import com.example.cinema.dto.CommentResponse;
import com.example.cinema.service.CommentService;
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

    /**
     * Lấy danh sách bình luận.
     * Sử dụng @RequestHeader để lấy token và xác định chủ sở hữu bình luận (myComment = true/false).
     */
    @GetMapping("/comments")
    public ResponseEntity<List<CommentResponse>> getComments(
            @RequestParam Long movieId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        // Giả sử bạn có logic để lấy accountId từ Token. 
        // Nếu không có token (chưa đăng nhập), currentUserId sẽ là null.
        Long currentUserId = extractUserIdFromHeader(authHeader);
        
        return ResponseEntity.ok(commentService.getCommentsByMovie(movieId, currentUserId));
    }

    @PostMapping("/comments")
    public ResponseEntity<?> createComment(
            @RequestBody CommentRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        Long accountId = extractUserIdFromHeader(authHeader);
        
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

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<?> deleteComment(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        Long accountId = extractUserIdFromHeader(authHeader);
        if (accountId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Vui lòng đăng nhập"));
        }

        try {
            commentService.deleteComment(accountId, id);
            return ResponseEntity.ok(Map.of("message", "Xóa thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/comments/{id}")
    public ResponseEntity<?> updateComment(
            @PathVariable Long id,
            @RequestBody CommentRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        Long accountId = extractUserIdFromHeader(authHeader);
        if (accountId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Vui lòng đăng nhập"));
        }

        try {
            commentService.updateComment(accountId, id, request.getContent());
            return ResponseEntity.ok(Map.of("message", "Sửa thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Hàm hỗ trợ trích xuất Account ID từ chuỗi "Bearer token..."
     * Bạn cần thay thế logic này bằng dịch vụ JWT thực tế của bạn.
     */
    private Long extractUserIdFromHeader(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            // String token = authHeader.substring(7);
            // return jwtService.getUserIdFromToken(token);
            
            // TẠM THỜI: Để test, bạn có thể lấy ID từ một nơi nào đó hoặc session nếu vẫn dùng session kết hợp
            // Nhưng tốt nhất là giải mã Token tại đây.
        }
        return null; 
    }
}