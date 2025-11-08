package com.example.cinema.dto;

public class ForgotPasswordRequest {
    private String requestId ;
    private String newPassword;
    private String confirmNewPassword;
    
    public ForgotPasswordRequest() {}

    public ForgotPasswordRequest(String requestId, String newPassword, String cfn) {
        this.requestId  = requestId;
        this.newPassword = newPassword;
        this.confirmNewPassword = cfn;
    }


    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
    public String getConfirmPassword(){
        return confirmNewPassword;
    }
    public void setConfirmPassword(String confirmNewPassword){
        this.confirmNewPassword = confirmNewPassword;
    }
    public String getRequestId(){
        return requestId;
    }
    public void setRequestId(String requestId){
        this.requestId = requestId;
    }
}

