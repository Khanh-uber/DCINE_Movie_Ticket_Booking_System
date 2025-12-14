package com.example.cinema.service;

import com.example.cinema.entity.*;
import com.example.cinema.repository.*;
import com.example.cinema.socket.SocketService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class CheckoutService {

    private final PaymentRepository checkoutRepo; 
    private final BookingRepository bookingRepo;
    private final VoucherRepository voucherRepo;
    private final BookingVoucherRepository bookingVoucherRepo;
    private final AccountService accountService;
    private final SocketService socketService;

    // Helper an toàn
    private Long safeLong(Object obj) {
        if (obj == null) return 0L;
        if (obj instanceof Number) return ((Number) obj).longValue();
        try { return Long.parseLong(obj.toString()); } catch (Exception e) { return 0L; }
    }

    private String safeString(Object obj) {
        return obj == null ? "" : String.valueOf(obj);
    }

    // =========================================================================
    // 1. CONFIRM CHECKOUT
    // =========================================================================
    @Transactional
    public Map<String, Object> confirmCheckout(Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> order = (Map<String, Object>) payload.getOrDefault("order", new HashMap<>());
            String paymentMethod = safeString(payload.getOrDefault("paymentMethod", "wallet"));
            
            Map<String, Object> totals = (Map<String, Object>) order.get("totals");
            if (totals == null) throw new RuntimeException("Totals must be computed before confirm");
            order.put("totals", totals);
            long grandTotal = safeLong(totals.get("grandTotal"));

            // Lưu DB
            String transactionId = "trans_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
            Booking booking = bookingRepo.findByBooking(((Number) order.get("bookingId")).longValue());
            if (booking == null) throw new RuntimeException("Booking not found");

            Payment pm = new Payment();
            pm.setBookingId(booking.getBookingId());
            pm.setTransactionId(transactionId);
            pm.setMethod(paymentMethod); 
            pm.setAmount((double) grandTotal);
            pm.setStatus("PENDING");
            pm.setCreatedAt(LocalDateTime.now());
            checkoutRepo.save(pm); 
    
            // Voucher logic
            String voucherCode = safeString(totals.get("discountCode"));
            long discountAmount = safeLong(totals.get("discountAmount"));
            if (voucherCode != null && !voucherCode.isEmpty()) {
                Voucher v = voucherRepo.findVoucherByCode(voucherCode);
                if (v != null) {
                    v.setUsedCount(v.getUsedCount() + 1);
                    voucherRepo.save(v);
                    BookingVoucherId bvid = new BookingVoucherId(booking.getBookingId(), v.getVoucherId());
                    BookingVoucher bv = new BookingVoucher();
                    bv.setId(bvid);
                    bv.setDiscountApplied(discountAmount);
                    bookingVoucherRepo.save(bv);
                }
            }
            
            // Tạo QR (Nhớ thay IP 192.168.1.11 bằng IP máy bạn)
            String IP = "192.168.1.11"; 
            String PORT = "8080"; 
            String deeplink = String.format("http://%s:%s/mobile-pay.html?trans=%s", IP, PORT, transactionId);
            String qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + URLEncoder.encode(deeplink, StandardCharsets.UTF_8);

            Map<String, Object> qrMap = new HashMap<>();
            qrMap.put("imageUrl", qrUrl);
            qrMap.put("deeplink", deeplink);
            
            order.put("transactionId", transactionId); 
            response.put("status", "pending");
            response.put("transactionId", transactionId);
            response.put("order", order);
            response.put("qr", qrMap);

            return response;
        } catch (Exception e) {
            e.printStackTrace();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return response;
        }
    }

    // =========================================================================
    // 2. GET ORDER (ĐÃ SỬA LỖI COMPILER - Dòng 139)
    // =========================================================================
    public Map<String, Object> getOrderByTransactionId(String transactionId) {
        try {
            Payment pm = checkoutRepo.findByTransactionId(transactionId)
                    .orElseThrow(() -> new RuntimeException("Transaction not found"));

            Long bookingId = pm.getBookingId();

            String movieTitle = "Phim chưa xác định";
            String theaterName = "D-Cine";
            String showDate = "--";
            String showTime = "--";

            // --- [SỬA LẠI CHỖ NÀY] ---
            // Nhận List thay vì Map để khớp với Repository
            List<Map<String, Object>> showtimeList = checkoutRepo.findShowtimeInfoByBooking(bookingId);
            
            // Kiểm tra List có dữ liệu không rồi mới lấy phần tử đầu tiên
            if (showtimeList != null && !showtimeList.isEmpty()) {
                Map<String, Object> showtimeInfo = showtimeList.get(0);
                
                movieTitle = safeString(showtimeInfo.get("movieTitle"));
                theaterName = safeString(showtimeInfo.get("theaterName"));
                
                Object startTimeObj = showtimeInfo.get("startTime");
                if (startTimeObj != null) {
                    String ts = startTimeObj.toString().replace(" ", "T");
                    try {
                        if (ts.length() > 19) ts = ts.substring(0, 19);
                        LocalDateTime ldt = LocalDateTime.parse(ts);
                        showDate = ldt.toLocalDate().toString();
                        showTime = ldt.toLocalTime().toString();
                    } catch (Exception e) {
                        showDate = startTimeObj.toString(); 
                    }
                }
            }

            // Lấy Ghế (Code cũ đã sửa JOIN)
            List<Map<String, Object>> seatMaps = checkoutRepo.findSeatsByBooking(bookingId);
            List<String> seatsCode = new ArrayList<>();
            long ticketAmount = 0;
            if (seatMaps != null) {
                for (Map<String, Object> s : seatMaps) {
                    if (s.get("seat_code") != null) seatsCode.add(s.get("seat_code").toString());
                    if (s.get("price") != null) ticketAmount += safeLong(s.get("price"));
                }
            }

            // Lấy Combo
            List<Map<String, Object>> combosRaw = checkoutRepo.findCombosByBooking(bookingId);
            List<Map<String, Object>> combos = new ArrayList<>();
            long combosAmount = 0;
            if (combosRaw != null) {
                for (Map<String, Object> c : combosRaw) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("name", c.get("name"));
                    item.put("qty", c.get("qty"));
                    long price = safeLong(c.get("price"));
                    item.put("price", price);
                    combos.add(item);
                    combosAmount += price;
                }
            }

            // Tổng hợp
            Map<String, Object> ticket = new HashMap<>();
            ticket.put("movieTitle", movieTitle);
            ticket.put("theaterName", theaterName);
            ticket.put("date", showDate);
            ticket.put("time", showTime);
            ticket.put("seats", seatsCode);

            Map<String, Object> totals = new HashMap<>();
            totals.put("ticketAmount", ticketAmount);
            totals.put("combosAmount", combosAmount);
            totals.put("grandTotal", pm.getAmount());

            Map<String, Object> res = new HashMap<>();
            res.put("orderId", "ORD-" + bookingId);
            res.put("transactionId", pm.getTransactionId());
            res.put("ticket", ticket);
            res.put("totals", totals);
            res.put("combos", combos);

            return res;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException(e.getMessage());
        }
    }

    // 3. MARK PAID (Giữ nguyên)
    @Transactional
    public Map<String, Object> markPaymentPaid(String transactionId) {
        try {
            Payment pm = checkoutRepo.findByTransactionId(transactionId)
                    .orElseThrow(() -> new RuntimeException("Payment not found"));

            if (!"PENDING".equals(pm.getStatus())) {
                Map<String, Object> r = new HashMap<>();
                r.put("status", pm.getStatus().toLowerCase());
                return Collections.singletonMap("payment", r);
            }

            pm.setStatus("PAID");
            pm.setPaidAt(LocalDateTime.now());
            checkoutRepo.save(pm); 

            Booking booking = bookingRepo.findById(pm.getBookingId()).orElse(null);
            if (booking != null) {
                booking.setStatus("PAID");
                booking.setTotalAmount(((Number) pm.getAmount()).longValue());
                bookingRepo.save(booking);
                Long accountId = booking.getAccountId();
                if (accountId != null) {
                    Long trueTotal = bookingRepo.getTotalSpent(accountId);
                    if (trueTotal == null) trueTotal = 0L;
                    accountService.updateExactTotalSpending(accountId, trueTotal);
                }
            }

            Map<String, Object> paymentData = new HashMap<>();
            paymentData.put("transactionId", pm.getTransactionId());
            paymentData.put("status", "paid");
            paymentData.put("amount", pm.getAmount());
            paymentData.put("bookingId", pm.getBookingId());

            try {
                socketService.emitPaymentSuccess(Collections.singletonMap("payment", paymentData));
            } catch (Exception ex) {
                System.err.println("Socket emit failed: " + ex.getMessage());
            }

            return Collections.singletonMap("payment", paymentData);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException(e.getMessage());
        }
    }

    // 4. Calculate Voucher
    public Map<String, Object> calculateOrderSummary(Map<String, Object> order, String voucherCode) {
        Map<String, Object> totals = (Map<String, Object>) order.getOrDefault("totals", new HashMap<>());
        long ticketAmount = safeLong(totals.get("ticketAmount"));
        long combosAmount = safeLong(totals.get("combosAmount"));
        
        long subTotal = ticketAmount + combosAmount;
        long discountAmount = 0;

        if (voucherCode != null) {
            Voucher v = voucherRepo.findVoucherByCode(voucherCode);
            if (v != null) {
                discountAmount = calculateDiscount(subTotal, v);
            }
        }
        long grandTotal = Math.max(0, subTotal - discountAmount);
        Map<String, Object> calculatedTotals = new HashMap<>();
        calculatedTotals.put("ticketAmount", ticketAmount);
        calculatedTotals.put("combosAmount", combosAmount);
        calculatedTotals.put("subTotal", subTotal);
        calculatedTotals.put("discountAmount", discountAmount);
        calculatedTotals.put("discountCode", voucherCode);
        calculatedTotals.put("grandTotal", grandTotal);
        order.put("totals", calculatedTotals);
        return order;
    }
    
    public long calculateDiscount(long subTotal, Voucher v) {
        if (subTotal < v.getMinOrder()) return 0;
        
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(v.getStartAt()) || now.isAfter(v.getEndAt())) return 0;

        if (v.getUsedCount() >= v.getUsageLimit()) return 0;

        long discount = 0;
        if (v.getType().equals("PERCENT")){
            discount = Math.round(subTotal * (v.getValue()/100.0));
        }
        else if (v.getType().equalsIgnoreCase("AMOUNT")) {
            discount = Math.round(v.getValue());
        }
        discount = Math.min(discount, subTotal);
        return discount ;
    }
}