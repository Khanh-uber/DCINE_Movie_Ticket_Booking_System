package com.example.cinema.service;

import com.example.cinema.entity.Booking;
import com.example.cinema.entity.Payment;
import com.example.cinema.entity.Voucher;
import com.example.cinema.repository.BookingRepository;
import com.example.cinema.repository.PaymentRepository;
import com.example.cinema.repository.VoucherRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.transaction.Transactional;

import com.example.cinema.socket.SocketService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class CheckoutService {

    private final PaymentRepository checkoutRepo;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final SocketService socketService;
    private final BookingRepository bookingRepo;
    private final VoucherRepository voucherRepo;

    // Helper an toàn
    private Long safeLong(Object obj) {
        if (obj == null) return 0L;
        if (obj instanceof Number) return ((Number) obj).longValue();
        try { return Long.parseLong(obj.toString()); } catch (Exception e) { return 0L; }
    }

    private String safeString(Object obj) {
        return obj == null ? "" : String.valueOf(obj);
    }

<<<<<<< HEAD
    // =========================================================================
    // // 1. CONFIRM CHECKOUT (Lưu chi tiết ghế & Sử dụng checkoutRepo)
    // =========================================================================
    @Transactional
=======
>>>>>>> 3abafc124593e6e8d32964fa459311ca06329dd1
    public Map<String, Object> confirmCheckout(Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();

        try {
            Long accountId = safeLong(payload.get("accountId"));
            Map<String, Object> order = (Map<String, Object>) payload.getOrDefault("order", new HashMap<>());
            String paymentMethod = safeString(payload.getOrDefault("paymentMethod", "wallet"));
            
            // // 2. Parse Ghế & Combo 
            // List<Map<String,Object>> rawSeatItems = new ArrayList<>();
            // if (ticket.containsKey("seatItems") && ticket.get("seatItems") instanceof List) {
            //     rawSeatItems = (List<Map<String,Object>>) ticket.get("seatItems");
            // } else if (ticket.containsKey("items") && ticket.get("items") instanceof List) {
            //     rawSeatItems = (List<Map<String,Object>>) ticket.get("items");
            // }

            // List<Map<String,Object>> rawCombos = new ArrayList<>();
            // if (order.containsKey("combos") && order.get("combos") instanceof List) {
            //     rawCombos = (List<Map<String,Object>>) order.get("combos");
            // }

            // // 3. Tính toán tiền Server-side
            // long ticketAmount = 0;
            
            // for(Map<String,Object> s : rawSeatItems) {
            //     if(s == null) continue;
            //     long p = safeLong(s.get("price"));
            //     if(p == 0) p = safeLong(s.get("unitPrice"));
            //     ticketAmount += p;
            // }

            // long combosAmount = 0;
            // for(Map<String,Object> c : rawCombos) {
            //     if(c == null) continue;
            //     long line = safeLong(c.get("lineTotal"));
            //     if(line == 0) {
            //         long unit = safeLong(c.get("unitPrice"));
            //         if (unit == 0) unit = safeLong(c.get("price"));
            //         long qty = safeLong(c.get("qty"));
            //         if (qty == 0) qty = safeLong(c.get("quantity"));
            //         line = unit * qty;
            //     }
            //     combosAmount += line;
            // }

            Map<String, Object> totals = (Map<String, Object>) order.get("totals");
            if (totals == null)
                throw new RuntimeException("Totals must be computed before confirm");


            // Update Totals
            // Map<String, Object> totals = new HashMap<>();
            // totals.put("ticketAmount", ticketAmount);
            // totals.put("combosAmount", combosAmount);
            // totals.put("subTotal", subTotal);
            // totals.put("vat", vat);
            // totals.put("grandTotal", grandTotal);
            // totals.put("discountAmount", discountAmount);
            order.put("totals", totals);
            long grandTotal = safeLong(totals.get("grandTotal"));
            // 4. Chuẩn bị lưu DB
            String transactionId = "trans_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
            
            // LƯU Ý: Lưu rawSeatItems (List<Map<String, Object>>) chi tiết vào DB
            // String seatsJson = objectMapper.writeValueAsString(rawSeatItems); 
            
<<<<<<< HEAD
            // String combosJson = objectMapper.writeValueAsString(rawCombos);
            Booking booking = bookingRepo.findByBooking(((Number) order.get("bookingId")).longValue());
            Payment pm = new Payment();
            pm.setBookingId(booking.getBookingId());
            pm.setTransactionId(transactionId);
            pm.setMethod(paymentMethod);
            pm.setAmount((double) grandTotal);
            pm.setStatus("PENDING");
            pm.setCreatedAt(LocalDateTime.now());
            checkoutRepo.save(pm); 
    
=======
            String combosJson = objectMapper.writeValueAsString(rawCombos);
            
            Payment pm = Payment.builder()
                .orderId(orderId)
                .transactionId(transactionId)
                //.accountId(accountId)
                .amount(grandTotal)
                .method(paymentMethod)
                .status("PENDING")
                .movieTitle(safeString(ticket.get("movieTitle")))
                .theaterName(safeString(ticket.get("theaterName")))
                .showDate(safeString(ticket.get("date")))
                .showTime(safeString(ticket.get("time")))
                .seats(seatsJson) // <-- Đã lưu JSON chi tiết ghế (code, price)
                .combos(combosJson)
                .ticketAmount(ticketAmount) // <-- Lưu tổng tiền ghế
                .combosAmount(combosAmount)
                .vat(vat)
                .discountAmount(discountAmount)
                .build();

            checkoutRepo.save(pm); // <--- Sử dụng checkoutRepo
>>>>>>> 3abafc124593e6e8d32964fa459311ca06329dd1

            // 6. Tạo QR
            String IP = "10.45.69.10"; 
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
            System.err.println("!!! LỖI TRONG confirmCheckout !!!");
            e.printStackTrace();
            response.put("status", "error");
            response.put("message", e.getMessage());
            response.put("errorType", e.getClass().getName());
            return response;
        }
    }

    // // =========================================================================
    // // 2. GET ORDER (Mobile/FE Summary)
    // // =========================================================================
    // public Map<String, Object> getOrderByTransactionId(String transactionId) {
    //     try {
    //         Payment pm = checkoutRepo.findByTransactionId(transactionId) // <--- Sử dụng checkoutRepo
    //                 .orElseThrow(() -> new RuntimeException("Transaction not found"));

    //         // Lấy List chi tiết ghế từ JSON đã lưu
    //         List<Map<String,Object>> seatItems = new ArrayList<>();
    //         try { 
    //             if(pm.getSeats() != null) {
    //                 seatItems = objectMapper.readValue(pm.getSeats(), List.class); 
    //             } 
    //         } catch(Exception e){
    //             System.err.println("Lỗi đọc JSON ghế: " + e.getMessage());
    //         }
            
    //         // Lấy danh sách mã ghế (dùng cho trường "seats")
    //         List<String> seatsCode = seatItems.stream()
    //                                         .map(s -> safeString(s.get("code")))
    //                                         .filter(s -> !s.isEmpty())
    //                                         .toList();

    //         // Lấy combo từ JSON
    //         List<Map<String,Object>> combos = new ArrayList<>();
    //         try { if(pm.getCombos() != null) combos = objectMapper.readValue(pm.getCombos(), List.class); } catch(Exception e){}

    //         Map<String, Object> totals = new HashMap<>();
    //         long ticketAmount = safeLong(pm.getTicketAmount()); 
            
    //         totals.put("ticketAmount", ticketAmount); 
    //         totals.put("combosAmount", safeLong(pm.getCombosAmount()));
    //         totals.put("subTotal", ticketAmount + safeLong(pm.getCombosAmount()));
    //         totals.put("vat", safeLong(pm.getVat()));
    //         totals.put("discountAmount", safeLong(pm.getDiscountAmount()));
    //         totals.put("grandTotal", safeLong(pm.getAmount()));

    //         Map<String, Object> ticket = new HashMap<>();
    //         ticket.put("movieTitle", pm.getMovieTitle());
    //         ticket.put("theaterName", pm.getTheaterName());
    //         ticket.put("date", pm.getShowDate());
    //         ticket.put("time", pm.getShowTime());
            
    //         // TRẢ VỀ: Gán List chi tiết ghế vào "items"
    //         ticket.put("items", seatItems);
    //         // TRẢ VỀ: Gán List mã ghế vào "seats"
    //         ticket.put("seats", seatsCode);

    //         Map<String, Object> res = new HashMap<>();
    //         res.put("orderId", String.valueOf(pm.getOrderId()));
    //         res.put("grandTotal", pm.getAmount());
    //         res.put("ticket", ticket);
    //         res.put("totals", totals);
    //         res.put("combos", combos);
    //         res.put("transactionId", pm.getTransactionId()); 
    //         return res;

    //     } catch (Exception e) {
    //         e.printStackTrace();
    //         return new HashMap<>();
    //     }
    // }

    // =========================================================================
    // 3. MARK PAID (Sử dụng checkoutRepo)
    // =========================================================================
    @Transactional
    public Map<String, Object> markPaymentPaid(String transactionId) {
        try {
            Payment pm = checkoutRepo.findByTransactionId(transactionId) // <--- Sử dụng checkoutRepo
                    .orElseThrow(() -> new RuntimeException("Payment not found"));

            if (!"PENDING".equals(pm.getStatus())) {
                Map<String, Object> r = new HashMap<>();
                r.put("status", pm.getStatus().toLowerCase());
                return Collections.singletonMap("payment", r);
            }

            pm.setStatus("PAID");
            pm.setPaidAt(LocalDateTime.now());
            checkoutRepo.save(pm); // <--- Sử dụng checkoutRepo


            Booking booking = bookingRepo.findById(pm.getBookingId()).orElse(null);
            if (booking != null) {
                booking.setStatus("PAID");
                booking.setTotalAmount(((Number) pm.getAmount()).longValue());
                bookingRepo.save(booking);
                // Xoá ghế hold trong Redis
                // redisSeatService.clearHoldForShowtime(booking.getShowtimeId(), booking.getAccountId());
            }

            Map<String, Object> paymentData = new HashMap<>();
            paymentData.put("transactionId", pm.getTransactionId());
            paymentData.put("status", "paid");
            paymentData.put("amount", pm.getAmount());

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
    
    // 4. CALCULATE ORDER SUMMARY
    public long calculateDiscount(long subTotal, Voucher v) {
        // check min order
        if (subTotal < v.getMinOrder()) return 0;
        
        // check date 
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(v.getStartAt()) || now.isAfter(v.getEndAt())) return 0;

        // Check usage limit
        if (v.getUsedCount() >= v.getUsageLimit()) return 0;

        long discount = 0;
        
        // Type percent
        if (v.getType().equals("PERCENT")){
            discount = Math.round(subTotal * (v.getValue()/100.0));
        }
        else if (v.getType().equalsIgnoreCase("AMOUNT")) {
            discount = Math.round(v.getValue());
        }
        // Dam bao khong giam qua tong tien
        discount = Math.min(discount, subTotal);
        return discount ;
    }
    public Map<String, Object> calculateOrderSummary(Map<String, Object> order, String voucherCode) {
        Map<String, Object> totals = (Map<String, Object>) order.getOrDefault("totals", new HashMap<>());
        long ticketAmount = safeLong(totals.get("ticketAmount"));
        long combosAmount = safeLong(totals.get("combosAmount"));
        // long discountAmount = safeLong(totals.get("discountAmount")); 
        
        
        long subTotal = ticketAmount + combosAmount;

        long discountAmount = 0;

        if (voucherCode != null) {
            Voucher v = voucherRepo.findVoucherByCode(voucherCode);

            if (v != null) {
                discountAmount = calculateDiscount(subTotal, v);
            } else {
                System.out.println("Voucher không hợp lệ: " + voucherCode);
            }
        }
        long vat = Math.round(subTotal * 0.08);
        long grandTotal = subTotal + vat - discountAmount;
        
        grandTotal = Math.max(0, grandTotal);
        

        Map<String, Object> calculatedTotals = new HashMap<>();
        calculatedTotals.put("ticketAmount", ticketAmount);
        calculatedTotals.put("combosAmount", combosAmount);
        calculatedTotals.put("subTotal", subTotal);
        calculatedTotals.put("vat", vat);
        calculatedTotals.put("discountAmount", discountAmount);
        calculatedTotals.put("discountCode", voucherCode);
        calculatedTotals.put("grandTotal", grandTotal);
        order.put("totals", calculatedTotals);
        return order;
    }
}