package com.example.cinema.controller;

import com.example.cinema.service.CheckoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/checkout")
@RequiredArgsConstructor
public class CheckoutController {

    private final CheckoutService checkoutService;

    // 1. Tạo QR & Order
    @PostMapping("/confirm")
    public ResponseEntity<?> confirmCheckout(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(checkoutService.confirmCheckout(payload));
    }

    // 2. Mobile xác nhận thanh toán
    @PostMapping("/mark-paid")
    public ResponseEntity<?> markPaymentPaid(@RequestParam String trans) {
        return ResponseEntity.ok(checkoutService.markPaymentPaid(trans));
    }

    // 3. Mobile lấy thông tin đơn hàng
    @GetMapping("/order")
    public ResponseEntity<?> getOrder(@RequestParam String trans) {
        return ResponseEntity.ok(checkoutService.getOrderByTransactionId(trans));
    }

    @PostMapping("/apply-voucher")
    public ResponseEntity<?> applyVoucher(@RequestBody Map<String, Object> payload) {
        Map<String, Object> order = (Map<String, Object>) payload.get("order");
        
        Map<String, Object> calculatedOrder = checkoutService.calculateOrderSummary(order);
        
        return ResponseEntity.ok(calculatedOrder);
    }
    
}