package com.example.cinema.service;
import java.time.LocalDateTime;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;

import com.example.cinema.dto.OtpRequest;
import com.example.cinema.entity.OtpRecord;
import com.example.cinema.repository.OtpRepository;

// import jakarta.transaction.Transactional;

@Transactional
@Service
public class OtpService {

    private final OtpRepository otpRepo;
    
    public OtpService(OtpRepository otpRepo){
        this.otpRepo = otpRepo;
    }

    // === Gui OTP ===
    public Map<String, Object> sendOtp(OtpRequest req){
        String identifier = req.getIdentifier().trim();
        

        String code = String.format("%06d", (int) (Math.random() * 1_000_000));
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(3);
        // 3. Xóa các OTP cũ của user này (nếu có)
        otpRepo.deleteIdentifier(identifier);

        OtpRecord otp = new OtpRecord();
        otp.setExpiresAt(expiresAt);
        otp.setIdentifier(identifier);
        otp.setCode(code);
        String reqId = UUID.randomUUID().toString();
        otp.setRequestId(reqId);
        otp.setToken(reqId);

        // luu db 
        otpRepo.save(otp);
        
        System.out.println("Ma OTP cua ban cho "+identifier+" la "+ code);

        //tra phan hoi chuan Json FE
        return Map.of(
                "requestId", otp.getRequestId(),
                "token", otp.getToken()
        );
    }
    public OtpRecord verifyOtp(String requestId, String code){

        OtpRecord otp = otpRepo.findByRequestId(requestId );
        if (otp == null)
            throw new RuntimeException("Chưa gửi OTP hoặc đã hết hạn");

        if (otp.getExpiresAt().isBefore(LocalDateTime.now()))
            throw new RuntimeException("OTP đã hết hạn");

        if (!otp.getCode().equals(code))
            throw new RuntimeException("Mã OTP chưa chính xác");
        
        otp.setVerified(true);
        // otp.setToken(otp.getRequestId());
        otpRepo.save(otp);
        return otp;
    }
    
}
