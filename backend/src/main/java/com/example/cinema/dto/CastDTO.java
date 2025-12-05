package com.example.cinema.dto;

public class CastDTO {
    private String name;
    private String roleType;  
    private String castUrl;

    public CastDTO(){}

    public CastDTO(String name, String roleType, String castUrl){
        this.name = name;
        this.roleType = roleType;
        this.castUrl = castUrl;
    }
    
    public String getName(){return name;}
    public void setName(String name){this.name = name;}
    
    public String getRoleType(){return roleType;}
    public void setRoleType(String roleType){this.roleType = roleType;}
    
    public String getCastUrl() { return castUrl; }
    public void setCastUrl(String castUrl) { this.castUrl = castUrl; }
}

