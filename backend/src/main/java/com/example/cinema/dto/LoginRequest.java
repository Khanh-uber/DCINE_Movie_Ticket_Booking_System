package com.example.cinema.dto;


public class LoginRequest {
    private String emailOrPhone;
    private String password;
    

    // ✅ Bắt buộc cần constructor rỗng để Spring Boot mapping JSON vào
    public LoginRequest() {}

    public LoginRequest(String emailOrPhone, String password) {
       
        this.emailOrPhone = emailOrPhone;
        this.password = password;
    }

    // public String getLoginType(){
    //     return loginType;
    // }
    // public void setLoginType(String loginType){
    //     this.loginType = loginType;
    // }
    public String getEmailOrPhone() { return emailOrPhone; }
    public void setUsernameOrPhone(String emailOrPhone) { this.emailOrPhone = emailOrPhone; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    

}
