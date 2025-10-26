package com.example.cinema.dto;

public class ForgotPasswordRequest {
    private String usernameOrEmail;
    private String newPassword;
    private String confirmNewPassword;
    public ForgotPasswordRequest() {}

    public ForgotPasswordRequest(String usernameOrEmail, String newPassword, String cfn) {
        this.usernameOrEmail = usernameOrEmail;
        this.newPassword = newPassword;
        this.confirmNewPassword = cfn;
    }

    
    public String getUsernameOrEmail() {
        return usernameOrEmail;
    }

    public void setUsernameOrEmail(String usernameOrEmail) {
        this.usernameOrEmail = usernameOrEmail;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
    public String getConfirmNewPassword(){
        return confirmNewPassword;
    }
    public void setConfirmNewPassword(String confirmNewPassword){
        this.confirmNewPassword = confirmNewPassword;
    }
}

