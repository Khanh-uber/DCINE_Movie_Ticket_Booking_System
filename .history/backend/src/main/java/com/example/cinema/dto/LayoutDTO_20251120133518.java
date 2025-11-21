package com.example.cinema.dto;

import java.util.*;
public class LayoutDTO {
    private List<String> rows ;
    private Integer cols;
    private List<Integer> blocks;
    private Map<String, String> seatTypes;

    public LayoutDTO(){}

    public LayoutDTO(List<String> rows, Integer cols, List<Integer> blocks, Map<String, String> seatTypes){
        this.rows = rows;
        this.cols = cols;
        this.blocks = blocks;
        this.seatTypes = seatTypes;
    }
    public List<String> getRows(){return rows;}
    public void setRows(List<String> rows){this.rows = rows;}
    
    public Integer getCols(){return cols;}
    public void setCols(Integer cols){this.cols = cols;}

    public List<Integer> getBlock(){return blocks;}
    public void setBlock(List<Integer> blocks){this.blocks = blocks;}

    public Map<String, String> getSeatTypes(){
        return seatTypes;
    }
    public void setSeatTypes()
    
}
