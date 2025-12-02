package com.example.cinema.controller;
import com.example.cinema.entity.Account;
import com.example.cinema.entity.OtpRecord;
import com.example.cinema.service.AccountService;
import com.example.cinema.service.OtpService;

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

    private final OtpService otpService;
    public AuthController(AccountService accountService, OtpService otpService){
        this.accountService = accountService;
        this.otpService = otpService;
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
        Map<String, Object> user = new java.util.HashMap<>();
        user.put("id", acc.getAccountId());
        user.put("fullName", fullName);
        user.put("avatarUrl", avatarUrl);    
        user.put("email", acc.getEmail());
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

     // === KIỂM TRA PHIÊN (SESSION) ===
    @GetMapping("/session")
    public ResponseEntity<?> checkSession(HttpSession session) {
        Account u = (Account) session.getAttribute("user");
        if (u == null)
            return ResponseEntity
                .status(401)
                .body(Map.of("message", "Chưa đăng nhập"));
        return ResponseEntity.ok(Map.of(
            "message", "Đang đăng nhập",
            "username", u.getUsername(),
            "role", u.getRole().name()
    ));
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
