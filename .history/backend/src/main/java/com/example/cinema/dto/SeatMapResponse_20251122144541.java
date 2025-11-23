package com.example.cinema.dto;

import java.util.*;
public class SeatMapResponse {
    private List<String> rows;
    private int cols;
    private List<Integer> aislesAfter l
    private List<SeatItem> seats;

    public List<String> getRows() { return rows; }
    public void setRows(List<String> rows) { this.rows = rows; }

    public int getCols() { return cols; }
    public void setCols(int cols) { this.cols = cols; }

    public List<Integer> getAislesAfter() { return aislesAfter; }
    public void setAislesAfter(List<Integer> aislesAfter) { this.aislesAfter = aislesAfter; }

    public List<SeatItem> getSeats() { return seats; }
    public void setSeats(List<SeatItem> seats) { this.seats = seats; }

    // Seat item
    public static class SeatItem {
        private String code;
        private String row;
        private int col;
        private String zone;
        private String status;

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }

        public String getRow() { return row; }
        public void setRow(String row) { this.row = row; }

        public int getCol() { return col; }
        public void setCol(int col) { this.col = col; }

        public String getZone() { return zone; }
        public void setZone(String zone) { this.zone = zone; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

}
