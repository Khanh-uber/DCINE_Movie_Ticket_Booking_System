package com.example.cinema.controller;
import com.example.cinema.entity.Account;
import com.example.cinema.service.AccountService;
import jakarta.servlet.http.HttpSession;

import com.example.cinema.dto.ForgotPasswordRequest;
import com.example.cinema.dto.LoginRequest;
import com.example.cinema.dto.RegisterRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;


@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://127.0.0.1:5500", allowCredentials = "true")

public class AuthController {
    private final AccountService accountService;
    public AuthController(AccountService accountService){
        this.accountService = accountService;
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

            Map<String, Object> response = Map.of(
                "message", "Đăng nhập thành công",
                    "username", acc.getUsername(),
                    "role", acc.getRole()
            );
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

    // === Quên mât khẩu===
    @PostMapping("/reset-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest req){
        try {
            Account updated = accountService.resetPassword(req);
            return ResponseEntity.ok(Map.of(
                "message", "Doi mat khau thanh cong"
            ));
        }
        catch(Exception e){
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
