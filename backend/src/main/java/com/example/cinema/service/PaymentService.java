package com.example.cinema.service;

import com.example.cinema.dto.*;
import com.example.cinema.entity.Payment;
import com.example.cinema.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepo;

    public Payment createPayment(OrderSummaryDTO order, String method) {

        Payment p = new Payment();

        p.setTransactionId("trans_" + UUID.randomUUID());
        p.setOrderId("ORD_" + System.currentTimeMillis());

        p.setAmount(order.getTotals().getGrandTotal());
        p.setMethod(method);
        p.setStatus("PENDING");
        p.setCreatedAt(LocalDateTime.now());

        return paymentRepo.save(p);
    }

    public Payment markPaid(String transactionId) {
        Payment p = paymentRepo.findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        p.setStatus("PAID");
        p.setPaidAt(LocalDateTime.now());
        p.setUpdatedAt(LocalDateTime.now());

        return paymentRepo.save(p);
    }
}
