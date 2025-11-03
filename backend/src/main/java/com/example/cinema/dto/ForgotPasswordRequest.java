package com.example.cinema.dto;

public class ForgotPasswordRequest {
    private String channelType ; // name or email
    private String identifier;
    private String newPassword;
    private String confirmNewPassword;
    private String token;
    private String requestId ;
    public ForgotPasswordRequest() {}

    public ForgotPasswordRequest(String channelType, String newPassword, String cfn) {
        this.channelType  = channelType;
        this.newPassword = newPassword;
        this.confirmNewPassword = cfn;
    }

    public String getIdentifier(){
        return identifier;
    }
    public void setIdentifier(String identifier){
        this.identifier = identifier;
    }
    public String getChannelType() {
        return channelType;
    }

    public void setChannelType(String channelType) {
        this.channelType = channelType;
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
}

