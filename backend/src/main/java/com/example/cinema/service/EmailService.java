package com.example.cinema.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
     @Autowired
    private JavaMailSender mailSender;

    public void sendOtpMail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Mã xác thực OTP - D-Cine 🎬");
        message.setText("""
            Chào bạn 👋
            
            Mã OTP của bạn là: %s
            
            OTP có hiệu lực trong 5 phút.
            Vui lòng không chia sẻ mã này cho ai khác.
            
            D-Cine 🍿
            """.formatted(otp));

        mailSender.send(message);
    }
}
