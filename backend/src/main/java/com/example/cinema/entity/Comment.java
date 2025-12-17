package com.example.cinema.entity;

import jakarta.persistence.*;
import lombok.Data; // Dùng lombok cho gọn, hoặc bạn tự viết getter/setter như Booking.java
import java.sql.Timestamp;

@Entity
@Table(name = "comment")
@Data
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id")
    private Long commentId;

    @Column(name = "movie_id")
    private Long movieId; 

    @Column(name = "account_id")
    private Long accountId;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "created_at")
    private Timestamp createdAt;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "account_id", insertable = false, updatable = false)
    private Account account;
    
    @PrePersist
    protected void onCreate() {
        createdAt = new Timestamp(System.currentTimeMillis());
    }
}