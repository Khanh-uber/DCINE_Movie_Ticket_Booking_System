package com.example.cinema.dto;

import java.util.*;
public class LayoutDTO {
    private List<String> rows ;
    private Integer cols;
    private List<Integer> blocks;
    private Map<String, String> 

    public LayoutDTO(){}

    public LayoutDTO(List<String> rows, List<Integer> cols, List<Integer> aislesAfter){
        this.rows = rows;
        this.cols = cols;
        this.aislesAfter = aislesAfter;
    }
    public List<String> getRows(){return rows;}
    public void setRows(List<String> rows){this.rows = rows;}
    
    public List<Integer> getCols(){return cols;}
    public void setCols(List<Integer> cols){this.cols = cols;}

    public List<Integer> getAislesAfter(){return aislesAfter;}
    public void setAislesAfter(List<Integer> aislesAfter){this.aislesAfter = aislesAfter;}

    
    
}
