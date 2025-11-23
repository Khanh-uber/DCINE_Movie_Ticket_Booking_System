package com.example.cinema.dto;

import java.util.*;
public class SeatMapResponse {
    private List<String> rows;
    private int cols;
    private List<Integer> aislesAfter;
    private List<SeatItem> seats;

    public List<String> getRows() { return rows; }
    public void setRows(List<String> rows) { this.rows = rows; }

    public int getCols() { return cols; }
    public void setCols(int cols) { this.cols = cols; }

    public List<Integer> getAislesAfter() { return aislesAfter; }
    public void setAislesAfter(List<Integer> aislesAfter) { this.aislesAfter = aislesAfter; }

    public List<SeatItem> getSeats() { return seats; }
    public void setSeats(List<SeatItem> seats) { this.seats = seats; }

    

}
