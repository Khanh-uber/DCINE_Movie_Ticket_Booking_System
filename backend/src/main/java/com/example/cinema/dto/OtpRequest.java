package com.example.cinema.dto;

public class OtpRequest {
    private String channelType; // email hoac phone
    private String identifier; // email hoac so dien thoai
    private String code; // Ma OTP
    private String requestId;
    private String token;
    
    // getter and setter
    public String getChannelType (){
        return channelType;
    }
    public void setChannelType(String channelType){
        this.channelType = channelType;
    }
    public String getIdentifier(){
        return identifier;
    }
    public void setIdentifier(String identifier){
        this.identifier = identifier;
    }
    public String getCode(){
        return code;
    }
    public void setCode(String code){
        this.code = code;
    }
    public String getRequestId(){
        return requestId;
    }
    public void setRequestId(String requestId){
        this.requestId = requestId;
    }
    public String getToken(){
        return token;
    }
    public void setToken(String token){
        this.token = token;
    }
    
    
}
