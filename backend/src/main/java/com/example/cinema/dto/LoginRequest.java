package com.example.cinema.dto;


public class LoginRequest {
    private String loginType;
    private String identifier;
    private String password;
    

    // ✅ Bắt buộc cần constructor rỗng để Spring Boot mapping JSON vào
    public LoginRequest() {}

    public LoginRequest(String loginType, String identifier, String password) {
        this.loginType = loginType;
        this.identifier = identifier;
        this.password = password;
    }

    public String getLoginType(){
        return loginType;
    }
    public void setLoginType(String loginType){
        this.loginType = loginType;
    }
    public String getIdentifier() { return identifier; }
    public void setUsername(String identifier) { this.identifier = identifier; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    

}
