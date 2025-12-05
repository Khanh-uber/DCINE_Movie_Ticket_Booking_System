package com.example.cinema.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="booking_id")
    private Long bookingId;

    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "transaction_id", unique = true, nullable = false)
    private String transactionId;

    @Column(nullable = false)
    private Long amount;

    @Column(nullable = false)
    private String method; // wallet | bank | card

    @Column(nullable = false)
    private String status; // PENDING | PAID | FAILED

    // ------ Thông tin phim ------
    @Column(name = "movie_title")
    private String movieTitle;

    @Column(name = "theater_name")
    private String theaterName;

    @Column(name = "show_date")
    private String showDate;

    @Column(name = "show_time")
    private String showTime;

    // ------ Seats: dạng JSON ------
    @Column(name = "seats", columnDefinition = "TEXT")
    private String seats;

    // ------ Combos: dạng JSON ------
    @Column(name = "combos", columnDefinition = "TEXT")
    private String combos;

    // ------ Chi tiết tiền ------
    @Column(name = "ticket_amount")
    private Long ticketAmount;

    @Column(name = "combos_amount")
    private Long combosAmount;

    @Column(name = "vat")
    private Long vat;

    @Column(name = "discount_amount")
    private Long discountAmount;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    private q
}