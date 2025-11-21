package com.example.cinema.dto;

public class PricingDTO {
    private Integer adult;
    private Integer children;
    
    public PricingDTO(){}
    public PricingDTO(Integer adult, Integer children){
        this.adult = adult;
        this.children = children ;
    }

    public Integer getAdult(){return adult;}
    public void setAdult(Integer adult){this.adult = adult;}

    public Integer getChildren(){return children;}
    public void setChildren(Integer children){}
}
