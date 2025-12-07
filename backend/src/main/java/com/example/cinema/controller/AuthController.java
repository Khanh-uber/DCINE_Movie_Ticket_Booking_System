package com.example.cinema.controller;
import com.example.cinema.entity.Account;
import com.example.cinema.entity.Membership;
import com.example.cinema.entity.OtpRecord;
import com.example.cinema.service.AccountService;
import com.example.cinema.service.OtpService;
import com.example.cinema.dto.MembershipDTO;
import com.example.cinema.service.MembershipService;
import com.example.cinema.repository.AccountRepository; 
import com.example.cinema.repository.MembershipRepository;

import java.math.BigDecimal;
import java.util.List;

import jakarta.servlet.http.HttpSession;

import com.example.cinema.dto.ForgotPasswordRequest;
import com.example.cinema.dto.LoginRequest;
import com.example.cinema.dto.RegisterRequest;
import com.example.cinema.dto.OtpRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")

public class AuthController {
    private final AccountService accountService;
    private final MembershipService membershipService; 
    private final OtpService otpService;
    private final AccountRepository accountRepo; 
    private final MembershipRepository membershipRepo;
    public AuthController(AccountService accountService, MembershipService membershipService, 
                        OtpService otpService, AccountRepository accountRepo, MembershipRepository membershipRepo){
        this.accountService = accountService;
        this.otpService = otpService;
        this.membershipService = membershipService;
        this.accountRepo = accountRepo;
        this.membershipRepo = membershipRepo;
    }
    
     // === Đăng ký ===
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest rq){
        try {
            Account newAcc = accountService.register(rq);
            return ResponseEntity.ok(Map.of(
                "message", "Đăng ký thành công",
                "username", newAcc.getUsername()
            ));
        }
        catch (Exception e){
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    // === Đăng nhập ===
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest lr, HttpSession session) {
        
        try {
            Account acc = accountService.login(lr);
            // Lưu thông tin vào session
            session.setAttribute("user", acc);
            session.setAttribute("username", acc.getUsername());
            session.setAttribute("role", acc.getRole());
            session.setAttribute("accountId", acc.getAccountId());
        String fullName = acc.getUsername();
        if (acc.getCustomer() != null && acc.getCustomer().getFullName() != null) {
            fullName = acc.getCustomer().getFullName();
        }
        String avatarUrl = acc.getAvatarUrl();
        String accessToken = java.util.UUID.randomUUID().toString();

        BigDecimal totalSpending = acc.getTotalSpending();
        if (totalSpending == null) {
            totalSpending = BigDecimal.ZERO;
        }
        double spent = totalSpending.doubleValue();
        int loyaltyPoints = 0;
        try {
            loyaltyPoints = acc.getLoyaltyPoints(); 
        } catch (Exception ignore) {
        }
        String membershipTierName = "Standard"; 
        try {
            List<MembershipDTO> tiers = membershipService.getAllMemberships();
            double bestMin = -1;
            for (MembershipDTO t : tiers) {
                Double min = t.getMinSpent();
                if (min == null) min = 0.0;
                if (spent >= min && min > bestMin) {
                    bestMin = min;
                    membershipTierName = t.getName();
                }
            }
        } catch (Exception ignore) {
        }

        Map<String, Object> user = new java.util.HashMap<>();
        user.put("id", acc.getAccountId());
        user.put("fullName", fullName);
        user.put("avatarUrl", avatarUrl);    
        user.put("email", acc.getEmail());
        user.put("loyaltyPoints", loyaltyPoints);
        user.put("totalSpending", totalSpending);     
        user.put("membershipTierName", membershipTierName);
        Map<String, Object> data = new java.util.HashMap<>();
        data.put("accessToken", accessToken);
        data.put("user", user);
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("ok", true);
        response.put("message", "Login successful");
        response.put("data", data);

        return ResponseEntity.ok(response);
        }
        catch (Exception e){
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/session")
    public ResponseEntity<?> checkSession(HttpSession session) {
        Long accountId = (Long) session.getAttribute("accountId");
        if (accountId == null)
            return ResponseEntity.status(401).body(Map.of("message", "Chưa đăng nhập"));
        Account u = accountRepo.findByAccountId(accountId);
        if (u == null) {
            session.invalidate();
            return ResponseEntity.status(401).body(Map.of("message", "Tài khoản không tồn tại"));
        }
        BigDecimal totalSpending = u.getTotalSpending();
        if (totalSpending == null) totalSpending = BigDecimal.ZERO;
        String membershipTierName = "Standard"; 
        try {
            List<Membership> allTiers = membershipRepo.findAll(); 
            Membership newTier = null;
            double spent = totalSpending.doubleValue();
            for (Membership m : allTiers) {
                Double min = m.getMinSpending();
                if (min == null) min = 0.0;
                
                if (spent >= min) {
                    if (newTier == null || min > newTier.getMinSpending()) {
                        newTier = m;
                    }
                }
            }
            if (newTier != null) {
                membershipTierName = newTier.getName();
                Long currentTierId = u.getMemberShipId();
                if (currentTierId == null || !currentTierId.equals(newTier.getTierId())) {
                    u.setMemberShipId(newTier.getTierId());
                    accountRepo.save(u); 
                }
            }
        } catch (Exception e) {
            System.err.println("Lỗi tính hạng tại checkSession: " + e.getMessage());
        }
        String fullName = u.getUsername();
        if (u.getCustomer() != null && u.getCustomer().getFullName() != null) {
            fullName = u.getCustomer().getFullName();
        }

        Map<String, Object> responseData = new java.util.HashMap<>();
        responseData.put("message", "Đang đăng nhập");
        responseData.put("ok", true);
        responseData.put("accountId", u.getAccountId());
        responseData.put("username", u.getUsername());
        responseData.put("role", u.getRole().name());
        responseData.put("fullName", fullName);
        responseData.put("avatarUrl", u.getAvatarUrl());
        responseData.put("totalSpending", totalSpending);
        responseData.put("loyaltyPoints", u.getLoyaltyPoints());
        responseData.put("membershipTierName", membershipTierName);
        return ResponseEntity.ok(responseData);
    }

    // === Đăng xuat ===
    @GetMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(Map.of(
            "message", "Đã đăng xuất thành công"
    ));
    }
    // === Gui OTP ===
    @PostMapping("forgot/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody OtpRequest req){
        try {
            String identifier = req.getIdentifier();
            if (identifier==null || identifier.isBlank())
                throw new RuntimeException("Thêm email hoặc số điện thoại");
            Account acc = accountService.findByChannelType(identifier);
            if (acc == null)
                throw new RuntimeException("Không tìm thấy tài khoản");
            
            Map<String, Object> data = otpService.sendOtp(req);
            
            return ResponseEntity.ok(Map.of("ok", true, 
                                            "data", data,
                                            "message", "Đã gửi OTP thành công" ));
        } catch (Exception e){
            return ResponseEntity.badRequest().body(Map.of("ok", false,"error", e.getMessage()));
        }
    }
    // === Xac thuc OTP ===
    @PostMapping("/forgot/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody OtpRequest req){
        try {
            String requestId = req.getRequestId();
            String code = req.getCode();
            OtpRecord otp = otpService.verifyOtp(requestId, code);
            return ResponseEntity.ok(Map.of("ok", true,
                                            "message", "OTP hợp lệ",
                                            "data", otp.getRequestId()));
        } catch (Exception e){
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", e.getMessage()));
        }
    }
    // === Quên mât khẩu===
    @PostMapping("forgot/reset")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest req){
        try {
            accountService.resetPassword(req);
            return ResponseEntity.ok(Map.of(
                "ok", true, 
                "message", "Doi mat khau thanh cong"
            ));
        }
        catch(Exception e){
            return ResponseEntity.badRequest().body(Map.of("ok", false, 
                                                        "error", e.getMessage()));
        }
    }
}
