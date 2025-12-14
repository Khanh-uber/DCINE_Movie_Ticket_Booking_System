package com.example.cinema.socket;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class SocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public void emitPaymentSuccess(Map<String, Object> payload) {
        try {
            Map<String, Object> paymentData = (Map<String, Object>) payload.get("payment");
            String transId = (String) paymentData.get("transactionId");
            String topic = "/topic/payment/" + transId;
            
            messagingTemplate.convertAndSend(topic, paymentData);
            
            System.out.println("✅ Socket đã gửi tin đến: " + topic);
        } catch (Exception e) {
            System.err.println("❌ Lỗi gửi Socket: " + e.getMessage());
            e.printStackTrace();
        }
    }
}