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
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.TimeZone;
import java.util.TreeMap;
import java.security.SecureRandom;
import java.text.SimpleDateFormat;
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

        // 1. Thêm Log Info để luôn thấy giá trị trong console
        Long rawAmount = booking.getTotalAmount();
        log.info("[VNPAY DEBUG] Khởi tạo thanh toán - BookingID: {}, totalAmount từ DB: {}", bookingId, rawAmount);

        long bookingAmount = rawAmount == null ? 0L : rawAmount;

        if (bookingAmount <= 0) {
            log.error("[VNPAY ERROR] Booking {} không thể thanh toán vì số tiền = {}", bookingId, bookingAmount);
            throw new IllegalStateException("Số tiền thanh toán không hợp lệ (0đ). Vui lòng kiểm tra lại giỏ hàng.");
        }

        Payment payment = paymentRepository.findByBookingId(bookingId).orElseGet(Payment::new);
        if ("PAID".equalsIgnoreCase(payment.getStatus())) {
            throw new IllegalStateException("Booking payment is already marked paid");
        }

        String transactionId = generateTransactionId(bookingId);
        
        // 2. Ép kiểu và gán giá trị rõ ràng
        Double finalAmount = Double.valueOf(bookingAmount);
        payment.setAmount(finalAmount);
        payment.setBookingId(bookingId);
        payment.setTransactionId(transactionId);
        
        payment.setProvider("VNPAY");
        payment.setMethod("VNPAY");
        payment.setStatus("PENDING");
        payment.setCreatedAt(LocalDateTime.now());
        payment.setPaidAt(null);

        // 3. Lưu payment
        log.info("[VNPAY DEBUG] Chuẩn bị lưu Payment: transId={}, amount={}", payment.getTransactionId(), payment.getAmount());
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
        vnpParams.put("vnp_OrderInfo", "Thanhtoanbooking" + bookingId);
        vnpParams.put("vnp_BankCode", "NCB");
        vnpParams.put("vnp_OrderType", vnPayConfig.getOrderType());
        vnpParams.put("vnp_Locale", vnPayConfig.getLocale());
        vnpParams.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        vnpParams.put("vnp_IpAddr", normalizeClientIp(clientIp));

        String vnpCreateDate = now.format(VNP_DATE_FORMAT);
        vnpParams.put("vnp_CreateDate", vnpCreateDate);

        String vnpExpireDate = now.plusMinutes(15).format(VNP_DATE_FORMAT);
        vnpParams.put("vnp_ExpireDate", vnpExpireDate);

        validateRequiredParams(vnpParams);

        // VNPAY 2.1.0: Chuỗi băm và chuỗi truy vấn trên URL là giống hệt nhau (đã encode giá trị)
        String queryString = buildQueryString(vnpParams);
        String secureHash = vnPayConfig.hmacSHA512(hashSecret, queryString);
        String paymentUrl = vnPayConfig.getPayUrl() + "?" + queryString + "&vnp_SecureHash=" + secureHash;

        // =========================================================================
        // 🔥 ĐOẠN CODE DEBUG
        // =========================================================================
        System.err.println("\n======================= [VNPAY DEBUG CHECK LỖI] =======================");
        System.err.println("1. KIỂM TRA SỐ TIỀN (vnp_Amount): " + vnpParams.get("vnp_Amount") + " (Gốc từ DB: " + bookingAmount + ")");
        System.err.println("2. KIỂM TRA MÃ MERCHANT (vnp_TmnCode): '" + tmnCode + "'");
        System.err.println("3. KIỂM TRA MẬT KHẨU (vnp_HashSecret): '" + hashSecret + "'");
        System.err.println("4. KIỂM TRA IP CLIENT (vnp_IpAddr): '" + vnpParams.get("vnp_IpAddr") + "' <--- (NẾU LÀ 0:0:0:0:0:0:0:1 LÀ LỖI CHẮC CHẮN!)");
        System.err.println("5. KIỂM TRA MÚI GIỜ & NGÀY TẠO: " + vnpParams.get("vnp_CreateDate") + " (Zone: " + VNP_TIME_ZONE + ")");
        System.err.println("6. CHUỖI DỮ LIỆU ĐỂ MÃ HÓA: " + queryString);
        System.err.println("7. CHỮ KÝ AN TOÀN SINH RA: " + secureHash);
        System.err.println("🚀 LINK THANH TOÁN HOÀN CHỈNH GỬI SANG VNPAY:\n" + paymentUrl);
        System.err.println("=========================================================================\n");

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
                // Lọc bỏ tham số không phải vnp_ và giá trị trống
                .filter(entry -> entry.getKey().startsWith("vnp_") && entry.getValue() != null)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (left, right) -> right, TreeMap::new));

        String receivedSecureHash = callbackParams.remove("vnp_SecureHash");
        callbackParams.remove("vnp_SecureHashType"); 

        if (receivedSecureHash == null || receivedSecureHash.isBlank()) {
            return callbackResult(false, "INVALID_SIGNATURE", "Missing VNPAY secure hash", null, callbackParams.get("vnp_TxnRef"));
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
    
    private String buildRawParamString(Map<String, String> params) {
        return params.entrySet().stream()
                .filter(entry -> entry.getValue() != null && !entry.getValue().isBlank())
                .map(entry -> entry.getKey() + "=" + entry.getValue())
                .collect(Collectors.joining("&"));
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
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
