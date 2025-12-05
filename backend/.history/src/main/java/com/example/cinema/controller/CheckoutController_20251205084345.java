package com.example.cinema.controller;

import com.example.cinema.service.CheckoutService;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/checkout")
@
public class CheckoutController {

    @Autowired
    private ObjectMapper objectMapper;
    private final CheckoutService checkoutService;
    private Long getAccountId(){
        return 1L;
    }
    // 1. Tạo QR & Order
    @PostMapping("/confirm")
    public ResponseEntity<?> confirmCheckout(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(checkoutService.confirmCheckout(payload));
    }

    @Transactional
    @PostMapping("/mark-paid")
    public ResponseEntity<?> markPaymentPaid(@RequestParam String trans) {
        System.out.println("BACKEND RECEIVED trans = " + trans);
        return ResponseEntity.ok(checkoutService.markPaymentPaid(trans));
    }

    // // 3. Mobile lấy thông tin đơn hàng
    // @GetMapping("/order")
    // public ResponseEntity<?> getOrder(@RequestParam String trans) {
    //     return ResponseEntity.ok(checkoutService.getOrderByTransactionId(trans));
    // }


    @GetMapping("/summary")
    public ResponseEntity<?> summary() {
        return ResponseEntity.ok(Collections.emptyMap());
    }

    
    @PostMapping("/apply-voucher")
    public ResponseEntity<?> applyVoucher(@RequestBody Map<String, Object> payload) throws Exception {


        System.out.println("===== PAYLOAD RECEIVED =====");
        System.out.println(objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(payload));
        System.out.println("=================================");

        String code = (String) payload.get("code");
        if (code == null || code.trim().isEmpty()) {
            code = null; 
        }
        Map<String, Object> order = (Map<String, Object>) payload.get("order");
        Map<String, Object> calculatedOrder = checkoutService.calculateOrderSummary(order, code);

        return ResponseEntity.ok(calculatedOrder);
    }
}