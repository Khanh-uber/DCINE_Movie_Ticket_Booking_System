package com.example.cinema.dto;

public class SeatDTO {
    private String code;
    private String row;
    private String col;
    private String zone; //seat_type.name
    public SeatDTO(){}
    
    public SeatDTO(String code, String row, String col,String zone){

        this.code = code;
        this.row = row;
        this.col = col;
        this.zone = zone;
    }
    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getRow() {
        return row;
    }

    public void setRow(String row) {
        this.row = row;
    }

    public String getCol() {
        return col;
    }

    public void setCol( String col) {
        this.col = col;
    }
    public String getZone() {
        return zone;
    }

    public void setZone(String zone) {
        this.zone = zone;
    }


}
