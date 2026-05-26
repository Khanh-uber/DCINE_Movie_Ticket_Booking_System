package com.example.cinema.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

@Configuration
public class VnPayConfig {

    @Value("${vnpay.tmn-code:2QXUI4J4}")
    private String tmnCode;

    @Value("${vnpay.hash-secret:SECRETKEYVNPAY}")
    private String hashSecret;

    @Value("${vnpay.pay-url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String payUrl;

    @Value("${vnpay.return-url:http://localhost:8080/api/payment/vnpay-return}")
    private String returnUrl;

    @Value("${vnpay.result-url:http://localhost:3000/html/payment-result.html}")
    private String resultUrl;

    @Value("${vnpay.ipn-url:http://localhost:8080/api/payment/vnpay-ipn}")
    private String ipnUrl;

    private final String version = "2.1.0";
    private final String command = "pay";
    private final String currCode = "VND";
    private final String locale = "vn";
    private final String orderType = "other";

    public String getTmnCode() {
        return tmnCode;
    }

    public String getHashSecret() {
        return hashSecret;
    }

    public String getPayUrl() {
        return payUrl;
    }

    public String getReturnUrl() {
        return returnUrl;
    }

    public String getResultUrl() {
        return resultUrl;
    }

    public String getIpnUrl() {
        return ipnUrl;
    }

    public String getVersion() {
        return version;
    }

    public String getCommand() {
        return command;
    }

    public String getCurrCode() {
        return currCode;
    }

    public String getLocale() {
        return locale;
    }

    public String getOrderType() {
        return orderType;
    }

    public String hmacSHA512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            mac.init(secretKeySpec);
            return HexFormat.of().formatHex(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) {
            throw new RuntimeException("Cannot hash VNPAY payload", ex);
        }
    }
}
