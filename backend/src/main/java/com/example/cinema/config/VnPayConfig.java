package com.example.cinema.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

@Getter
@Configuration
public class VnPayConfig {

    @Value("${vnpay.tmn-code}")
    private String tmnCode;

    @Value("${vnpay.hash-secret}")
    private String hashSecret;

    @Value("${vnpay.pay-url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String payUrl;

    @Value("${vnpay.return-url:http://localhost:8080/api/payment/vnpay-return}")
    private String returnUrl;

    @Value("${vnpay.result-url}")
    private String resultUrl;

    @Value("${vnpay.ipn-url:http://localhost:8080/api/payment/vnpay-ipn}")
    private String ipnUrl;

    private final String version = "2.1.0";
    private final String command = "pay";
    private final String currCode = "VND";
    private final String locale = "vn";
    // Đồng bộ với mã ngành điện ảnh nếu cần, hoặc để 'other' làm mặc định
    private final String orderType = "190000"; 

    public static String hmacSHA512(final String key, final String data) {
        try {

            if (key == null || data == null) {
                throw new NullPointerException();
            }
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes(StandardCharsets.UTF_8);
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            return HexFormat.of().withUpperCase().formatHex(result);
        } catch (Exception ex) {
            return "";
        }
    }
}
