package com.example.cinema.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
@Entity
@Table(name = "otp_record")
public class OtpRecord {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id")
    private Long id;
    
    @Column(nullable = false)
    private String identifier; // email hoac phone
    
    @Column(nullable = false)
    private String code;
    
    @Column(name="created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
    
    private boolean verified = false;
    
    @Column(name="request_id")
    private String requestId;

    private String token; 
    public OtpRecord(){}
    public OtpRecord(String identifier, LocalDateTime expiresAt, String code){
        this.identifier = identifier;
        this.expiresAt = expiresAt;
        this.code = code;
    }

    public String getIdentifier(){
        return this.identifier;
    }
    public void setIdentifier(String identifier){
        this.identifier = identifier;
    }
    public LocalDateTime getExpiresAt(){
        return expiresAt;
    }
    public void setExpiresAt(LocalDateTime expiresAt){
        this.expiresAt = expiresAt;
    }
    public String getCode(){
        return code;
    }
    public void setCode(String code){
        this.code = code;
    }
    public LocalDateTime getCreatedAt(){
        return createdAt;
    }
    public void setCreatedAt(LocalDateTime createdAt){
        this.createdAt = createdAt;
    }
    public boolean isVerified(){
        return this.verified;
    }
    public void setVerified(boolean verified){
        this.verified = verified;
    }
    public String getToken(){
        return token;
    }
    public void setToken(String token){
        this.token = token;
    }
    public String getRequestId(){
        return requestId;
    }
    public void setRequestId(String requestId){
        this.requestId = requestId;
    }
    

}
