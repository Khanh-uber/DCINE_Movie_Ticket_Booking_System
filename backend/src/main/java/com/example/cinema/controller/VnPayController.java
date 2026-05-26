package com.example.cinema.controller;

import com.example.cinema.config.VnPayConfig;
import com.example.cinema.service.VnPayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class VnPayController {

    private final VnPayService vnPayService;
    private final VnPayConfig vnPayConfig;

    @PostMapping("/create-url/{bookingId}")
    public ResponseEntity<?> createPaymentUrl(
            @PathVariable Long bookingId,
            HttpSession session,
            HttpServletRequest request
    ) {
        Long accountId = extractAccountId(session.getAttribute("accountId"));
        if (accountId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Vui lòng đăng nhập để thanh toán"));
        }

        try {
            return ResponseEntity.ok(vnPayService.createPaymentUrl(bookingId, accountId, extractClientIp(request)));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(409).body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/vnpay-return")
    public ResponseEntity<Void> vnpayReturn(@RequestParam Map<String, String> params) {
        vnPayService.processCallback(params);

        UriComponentsBuilder redirectBuilder = UriComponentsBuilder.fromHttpUrl(vnPayConfig.getResultUrl());
        params.forEach(redirectBuilder::queryParam);

        URI redirectUri = redirectBuilder.build().encode().toUri();
        return ResponseEntity.status(302).location(redirectUri).build();
    }

    @GetMapping("/vnpay-ipn")
    public ResponseEntity<?> vnpayIpn(@RequestParam Map<String, String> params) {
        Map<String, Object> result = vnPayService.processCallback(params);
        String code = String.valueOf(result.get("code"));

        Map<String, String> ipnResponse = new LinkedHashMap<>();
        if ("INVALID_SIGNATURE".equals(code)) {
            ipnResponse.put("RspCode", "97");
            ipnResponse.put("Message", "Invalid signature");
        } else if ("ORDER_NOT_FOUND".equals(code)) {
            ipnResponse.put("RspCode", "01");
            ipnResponse.put("Message", "Order not found");
        } else if ("AMOUNT_MISMATCH".equals(code)) {
            ipnResponse.put("RspCode", "04");
            ipnResponse.put("Message", "Invalid amount");
        } else {
            ipnResponse.put("RspCode", "00");
            ipnResponse.put("Message", "Confirm Success");
        }

        return ResponseEntity.ok(ipnResponse);
    }

    private String extractClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return normalizeClientIp(forwardedFor.split(",")[0].trim());
        }
        return normalizeClientIp(request.getRemoteAddr());
    }

    private String normalizeClientIp(String clientIp) {
        if (clientIp == null || clientIp.isBlank()) {
            return "127.0.0.1";
        }

        String ip = clientIp.trim();
        if ("localhost".equalsIgnoreCase(ip) || "0:0:0:0:0:0:0:1".equals(ip) || "::1".equals(ip)) {
            return "127.0.0.1";
        }

        return ip;
    }

    private Long extractAccountId(Object rawAccountId) {
        if (rawAccountId == null) {
            return null;
        }
        if (rawAccountId instanceof Long longValue) {
            return longValue;
        }
        if (rawAccountId instanceof Number numberValue) {
            return numberValue.longValue();
        }

        String text = String.valueOf(rawAccountId).trim();
        if (text.isEmpty()) {
            return null;
        }

        try {
            return Long.parseLong(text);
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}
