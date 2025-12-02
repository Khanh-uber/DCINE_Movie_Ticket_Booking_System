package com.example.cinema.controller;

import com.example.cinema.service.CheckoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/checkout")
@CrossOrigin("*")
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

    // 4. API Summary: Trả về rỗng để FE tự dùng LocalStorage
    @GetMapping("/summary")
    public ResponseEntity<?> summary() {
        return ResponseEntity.ok(Collections.emptyMap());
    }

    // 5. API Voucher (Mock): Trả về nguyên order để không báo lỗi FE
    @PostMapping("/apply-voucher")
    public ResponseEntity<?> applyVoucher(@RequestBody Map<String, Object> payload) {
        // [ĐÃ SỬA]: API này sẽ gọi Service để tính toán totals
        Map<String, Object> order = (Map<String, Object>) payload.get("order");
        
        // Gọi hàm Service để tính toán lại totals hoàn chỉnh
        Map<String, Object> calculatedOrder = checkoutService.calculateOrderSummary(order);
        
        return ResponseEntity.ok(calculatedOrder);
    }
    
}