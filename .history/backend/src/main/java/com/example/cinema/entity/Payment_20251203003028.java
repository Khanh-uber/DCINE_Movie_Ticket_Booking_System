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
    @Column(name="payment_id")
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

    @Column(name = "created_at")
    private LocalDateTime createdAt;
    

    @Column(name = "paid_at")
    private LocalDateTime paidAt;
}