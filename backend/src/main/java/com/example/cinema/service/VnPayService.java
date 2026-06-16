package com.example.cinema.service;

import com.example.cinema.config.VnPayConfig;
import com.example.cinema.entity.Booking;
import com.example.cinema.entity.Payment;
import com.example.cinema.repository.BookingRepository;
import com.example.cinema.repository.PaymentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;
import java.security.SecureRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VnPayService {

    private static final DateTimeFormatter VNP_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    private static final ZoneId VNP_TIME_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final String VNP_ORDER_TYPE_CINEMA = "190000";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final VnPayConfig vnPayConfig;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final CheckoutService checkoutService;

    @Transactional
    public Map<String, Object> createPaymentUrl(Long bookingId, Long accountId, String clientIp) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + bookingId));

        if (!Objects.equals(booking.getAccountId(), accountId)) {
            throw new IllegalArgumentException("Booking does not belong to the current account");
        }

        if ("PAID".equalsIgnoreCase(booking.getStatus())) {
            throw new IllegalStateException("Booking is already paid");
        }

        Payment payment = paymentRepository.findByBookingId(bookingId).orElseGet(Payment::new);
        if ("PAID".equalsIgnoreCase(payment.getStatus())) {
            throw new IllegalStateException("Booking payment is already marked paid");
        }

        String transactionId = generateTransactionId(bookingId);
        payment.setBookingId(bookingId);
        payment.setTransactionId(transactionId);
        payment.setProvider("VNPAY");
        payment.setMethod("VNPAY");
        payment.setStatus("PENDING");
        payment.setCreatedAt(LocalDateTime.now());
        payment.setPaidAt(null);
        paymentRepository.save(payment);

        Booking latestBooking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + bookingId));
        long bookingAmount = latestBooking.getTotalAmount() == null ? 0L : latestBooking.getTotalAmount();
        if (bookingAmount <= 0) {
            throw new IllegalStateException("Booking total amount must be greater than 0");
        }
        payment.setAmount((double) bookingAmount);
        paymentRepository.save(payment);

        ZonedDateTime now = ZonedDateTime.now(VNP_TIME_ZONE);
        String tmnCode = safeTrim(vnPayConfig.getTmnCode());
        String hashSecret = safeTrim(vnPayConfig.getHashSecret());
        Map<String, String> vnpParams = new TreeMap<>();
        vnpParams.put("vnp_Version", vnPayConfig.getVersion());
        vnpParams.put("vnp_Command", vnPayConfig.getCommand());
        vnpParams.put("vnp_TmnCode", tmnCode);
        vnpParams.put("vnp_Amount", String.valueOf(bookingAmount * 100L));
        vnpParams.put("vnp_CurrCode", vnPayConfig.getCurrCode());
        vnpParams.put("vnp_TxnRef", transactionId);
        vnpParams.put("vnp_OrderInfo", "Thanh toan booking " + bookingId);
        vnpParams.put("vnp_OrderType", VNP_ORDER_TYPE_CINEMA);
        vnpParams.put("vnp_Locale", vnPayConfig.getLocale());
        vnpParams.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        vnpParams.put("vnp_IpAddr", normalizeClientIp(clientIp));
        vnpParams.put("vnp_CreateDate", now.format(VNP_DATE_FORMAT));
        vnpParams.put("vnp_ExpireDate", now.plusMinutes(15).format(VNP_DATE_FORMAT));

        validateRequiredParams(vnpParams);
        String hashData = buildHashData(vnpParams);
        String queryString = buildQueryString(vnpParams);
        String secureHash = vnPayConfig.hmacSHA512(hashSecret, hashData);

        log.info("[VNPAY DEBUG] createPaymentUrl bookingId={} transactionId={} timezone={}", bookingId, transactionId, VNP_TIME_ZONE);
        log.info("[VNPAY DEBUG] hashData(raw-before-hmac)={}", hashData);
        log.info("[VNPAY DEBUG] queryString(before-hash)={}", queryString);
        log.info("[VNPAY DEBUG] hashSecret={}", hashSecret);
        log.info("[VNPAY DEBUG] vnp_SecureHash={}", secureHash);

        String paymentUrl = vnPayConfig.getPayUrl() + "?" + queryString + "&vnp_SecureHash=" + secureHash;

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("bookingId", bookingId);
        response.put("transactionId", transactionId);
        response.put("amount", bookingAmount);
        response.put("paymentUrl", paymentUrl);
        response.put("returnUrl", vnPayConfig.getReturnUrl());
        response.put("ipnUrl", vnPayConfig.getIpnUrl());
        return response;
    }

    @Transactional
    public Map<String, Object> processCallback(Map<String, String> rawParams) {
        Map<String, String> callbackParams = rawParams.entrySet().stream()
                .filter(entry -> entry.getValue() != null && !entry.getValue().isBlank())
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (left, right) -> right, TreeMap::new));

        String receivedSecureHash = callbackParams.remove("vnp_SecureHash");
        callbackParams.remove("vnp_SecureHashType");

        if (receivedSecureHash == null || receivedSecureHash.isBlank()) {
            return callbackResult(false, "INVALID_SIGNATURE", "Missing VNPAY secure hash", null, null);
        }

        String computedSecureHash = vnPayConfig.hmacSHA512(
            safeTrim(vnPayConfig.getHashSecret()),
                buildHashData(callbackParams)
        );

        if (!computedSecureHash.equalsIgnoreCase(receivedSecureHash)) {
            return callbackResult(false, "INVALID_SIGNATURE", "Invalid VNPAY signature", null, callbackParams.get("vnp_TxnRef"));
        }

        String transactionId = callbackParams.get("vnp_TxnRef");
        if (transactionId == null || transactionId.isBlank()) {
            return callbackResult(false, "ORDER_NOT_FOUND", "Missing transaction reference", null, null);
        }

        Payment payment = paymentRepository.findByTransactionId(transactionId).orElse(null);
        if (payment == null) {
            return callbackResult(false, "ORDER_NOT_FOUND", "Payment not found", null, transactionId);
        }

        Booking booking = bookingRepository.findById(payment.getBookingId()).orElse(null);
        if (booking == null) {
            return callbackResult(false, "ORDER_NOT_FOUND", "Booking not found", payment.getBookingId(), transactionId);
        }

        long expectedAmount = (booking.getTotalAmount() == null ? 0L : booking.getTotalAmount()) * 100L;
        long paidAmount = parseLong(callbackParams.get("vnp_Amount"));
        if (paidAmount > 0 && expectedAmount > 0 && expectedAmount != paidAmount) {
            return callbackResult(false, "AMOUNT_MISMATCH", "VNPAY amount does not match booking total", booking.getBookingId(), transactionId);
        }

        payment.setProvider(resolveProvider(callbackParams.get("vnp_BankCode")));
        payment.setMethod("VNPAY");
        if (paidAmount > 0) {
            payment.setAmount(paidAmount / 100.0d);
        }

        String responseCode = callbackParams.getOrDefault("vnp_ResponseCode", "");
        String transactionStatus = callbackParams.getOrDefault("vnp_TransactionStatus", responseCode);

        if ("PAID".equalsIgnoreCase(payment.getStatus()) || "PAID".equalsIgnoreCase(booking.getStatus())) {
            paymentRepository.save(payment);
            return callbackResult(true, "ALREADY_CONFIRMED", "Payment was already confirmed", booking.getBookingId(), transactionId);
        }

        if ("00".equals(responseCode) && ("00".equals(transactionStatus) || transactionStatus.isBlank())) {
            payment.setStatus("PENDING");
            payment.setPaidAt(null);
            paymentRepository.save(payment);
            checkoutService.markPaymentPaid(transactionId);
            return callbackResult(true, "SUCCESS", "Payment confirmed", booking.getBookingId(), transactionId);
        }

        payment.setStatus("FAILED");
        payment.setPaidAt(null);
        paymentRepository.save(payment);
        return callbackResult(false, "PAYMENT_FAILED", "VNPAY returned response code " + responseCode, booking.getBookingId(), transactionId);
    }

    private String generateTransactionId(Long bookingId) {
        int randomSuffix = 1000 + SECURE_RANDOM.nextInt(9000);
        return bookingId
                + LocalDateTime.now().format(VNP_DATE_FORMAT)
            + randomSuffix;
    }

    private String buildHashData(Map<String, String> params) {
        return buildEncodedParamString(params);
    }

    private String buildQueryString(Map<String, String> params) {
        return buildEncodedParamString(params);
    }

    private String buildEncodedParamString(Map<String, String> params) {
        return params.entrySet().stream()
                .filter(entry -> entry.getValue() != null && !entry.getValue().isBlank())
                .map(entry -> encode(entry.getKey()) + "=" + encode(entry.getValue()))
                .collect(Collectors.joining("&"));
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private String safeTrim(String value) {
        return value == null ? "" : value.trim();
    }

    private void validateRequiredParams(Map<String, String> vnpParams) {
        requireNonBlank(vnpParams, "vnp_Version");
        requireNonBlank(vnpParams, "vnp_Command");
        requireNonBlank(vnpParams, "vnp_TmnCode");
        requireNonBlank(vnpParams, "vnp_Amount");
        requireNonBlank(vnpParams, "vnp_CurrCode");
        requireNonBlank(vnpParams, "vnp_TxnRef");
        requireNonBlank(vnpParams, "vnp_OrderInfo");
        requireNonBlank(vnpParams, "vnp_OrderType");
        requireNonBlank(vnpParams, "vnp_Locale");
        requireNonBlank(vnpParams, "vnp_ReturnUrl");
        requireNonBlank(vnpParams, "vnp_IpAddr");
        requireNonBlank(vnpParams, "vnp_CreateDate");
        requireNonBlank(vnpParams, "vnp_ExpireDate");
    }

    private void requireNonBlank(Map<String, String> vnpParams, String key) {
        String value = vnpParams.get(key);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException("Missing VNPAY required parameter: " + key);
        }
    }

    private long parseLong(String value) {
        if (value == null || value.isBlank()) {
            return 0L;
        }
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException ex) {
            return 0L;
        }
    }

    private String resolveProvider(String bankCode) {
        if (bankCode == null || bankCode.isBlank()) {
            return "VNPAY";
        }
        return bankCode;
    }

    private String normalizeClientIp(String clientIp) {
        if (clientIp == null || clientIp.isBlank() || "0:0:0:0:0:0:0:1".equals(clientIp)) {
            return "127.0.0.1";
        }
        return clientIp;
    }

    private Map<String, Object> callbackResult(
            boolean success,
            String code,
            String message,
            Long bookingId,
            String transactionId
    ) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", success);
        result.put("code", code);
        result.put("message", message);
        result.put("bookingId", bookingId);
        result.put("transactionId", transactionId);
        return result;
    }
}
