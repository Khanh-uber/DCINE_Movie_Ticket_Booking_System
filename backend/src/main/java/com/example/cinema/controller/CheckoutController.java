package com.example.cinema.controller;

import com.example.cinema.dto.*;
import com.example.cinema.entity.Payment;
import com.example.cinema.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/checkout")
public class CheckoutController {

    private final PaymentService paymentService;

    @PostMapping("/confirm")
    public Map<String, Object> confirm(@RequestBody CheckoutConfirmRequest req) {

        OrderSummaryDTO order = req.getOrder();
        String method = req.getPaymentMethod();

        Payment payment = paymentService.createPayment(order, method);

        // QR trả về FE
        QrDTO qr = new QrDTO();
        qr.setImageUrl("https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://dcine.com/mock-pay?id=" + payment.getTransactionId());
        qr.setDownloadUrl(qr.getImageUrl());

        // Convert Payment → DTO FE hiểu
        PaymentDTO paymentDTO = new PaymentDTO();
        paymentDTO.setOrderId(payment.getOrderId());
        paymentDTO.setTransactionId(payment.getTransactionId());
        paymentDTO.setStatus(payment.getStatus());
        paymentDTO.setAmount(payment.getAmount());
        paymentDTO.setPaymentMethod(payment.getMethod());
        paymentDTO.setCreatedAt(payment.getCreatedAt().toString());

        Map<String, Object> res = new HashMap<>();
        res.put("status", payment.getStatus());
        res.put("order", order);
        res.put("payment", paymentDTO);
        res.put("qr", qr);

        return res;
    }

    @PostMapping("/mark-paid")
    public Map<String, Object> markPaid(@RequestBody Map<String, String> body) {
        String transactionId = body.get("transactionId");

        Payment p = paymentService.markPaid(transactionId);

        Map<String, Object> res = new HashMap<>();
        res.put("status", "paid");
        res.put("transactionId", p.getTransactionId());
        return res;
    }
}
