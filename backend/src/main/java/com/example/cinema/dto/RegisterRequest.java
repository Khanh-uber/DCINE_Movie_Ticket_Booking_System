package com.example.cinema.dto;


// import java.time.LocalDate;

public class RegisterRequest {
    private String fullName;
    private String username;
    private String password;
    private String confirmPassword;
    private String phone;
    private String email;
    
    
    public RegisterRequest() {}

    public RegisterRequest(String username, String password, String fullName, String phone, String email, String cp) {
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.phone = phone;
        this.email = email;
        this.confirmPassword = cp;
    }

    // --- Getters & Setters ---
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    // public LocalDate getDob() {
    //     return dob;
    // }

    // public void setDob(LocalDate dob) {
    //     this.dob = dob;
    // }
    public String getEmail(){
        return this.email;
    }
        
    public void setEmail(String email){
        this.email = email;
    }
    public String getConfirmPassword(){
        return confirmPassword;
    }
    public void setConfirmPassword(String cp){
        confirmPassword = cp;
    }
    // public boolean isAgreeTerm(){
    //     return agreeTerm;
    // }
    // public void setAgreeTerm(boolean at){
    //     this.agreeTerm = at;
    // }
    // public String getRegisterType(){
    //     return registerType;
    // }
    // public void setRegisterType(String rt){
    //     this.registerType = rt;
    // }
    
}

