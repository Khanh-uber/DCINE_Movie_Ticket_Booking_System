package com.example.cinema.service;

import com.example.cinema.dto.CommentRequest;
import com.example.cinema.dto.CommentResponse;
import com.example.cinema.entity.Account;
import com.example.cinema.entity.Comment;
import com.example.cinema.repository.AccountRepository;
import com.example.cinema.repository.CommentRepository;
import com.example.cinema.repository.MovieRepository;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    private final CommentRepository commentRepo;
    private final MovieRepository movieRepo;
    private final AccountRepository accountRepo;

    public CommentService(CommentRepository commentRepo, MovieRepository movieRepo, AccountRepository accountRepo) {
        this.commentRepo = commentRepo;
        this.movieRepo = movieRepo;
        this.accountRepo = accountRepo;
    }

    public void addComment(Long accountId, CommentRequest request) {
        if (!movieRepo.existsById(request.getMovieId())) {
            throw new RuntimeException("Phim không tồn tại");
        }
        
        Comment comment = new Comment();
        comment.setAccountId(accountId);
        comment.setMovieId(request.getMovieId());
        comment.setContent(request.getContent());
        
        commentRepo.save(comment);
    }
// Trong file: com/example/cinema/service/CommentService.java

    public List<CommentResponse> getCommentsByMovie(Long movieId, Long currentUserId) {
        List<Comment> comments = commentRepo.findByMovieIdOrderByCreatedAtDesc(movieId);
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy HH:mm");

        return comments.stream().map(c -> {
            CommentResponse res = new CommentResponse();
            res.setId(c.getCommentId());
            res.setContent(c.getContent());
            res.setCreatedAt(sdf.format(c.getCreatedAt()));
            
            if (c.getAccount() != null) {
                String username = c.getAccount().getUsername(); 
                res.setFullName(username);
                String avatar = c.getAccount().getAvatarUrl();
                if (avatar == null || avatar.isEmpty()) {
                    avatar = "https://ui-avatars.com/api/?name=" + username + "&background=random&color=fff";
                }
                res.setAvatarUrl(avatar);
                
            } else {
                res.setFullName("Người dùng ẩn danh");
                res.setAvatarUrl("https://ui-avatars.com/api/?name=X&background=random");
            }
            if (currentUserId != null && currentUserId.equals(c.getAccountId())) {
                res.setMyComment(true);
            } else {
                res.setMyComment(false);
            }

            return res;
        }).collect(Collectors.toList());
    }

    public void deleteComment(Long accountId, Long commentId) {
        Comment comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment không tồn tại"));
        if (!comment.getAccountId().equals(accountId)) {
            throw new RuntimeException("Bạn không có quyền xóa comment này");
        }
        commentRepo.delete(comment);
    }
    public void updateComment(Long accountId, Long commentId, String newContent) {
        Comment comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment không tồn tại"));
        if (!comment.getAccountId().equals(accountId)) {
            throw new RuntimeException("Bạn không có quyền sửa comment này");
        }
        comment.setContent(newContent);
        commentRepo.save(comment);
    }
}