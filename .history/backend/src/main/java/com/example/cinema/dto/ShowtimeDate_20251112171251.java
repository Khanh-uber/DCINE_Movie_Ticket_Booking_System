package com.example.cinema.dto;

import java.util.List;

public class ShowtimeDate {
    private String date;
    private List<ShowtimeFormat> formats;

    public String getDate() {
        return date;
    }
    public void setDate(String date) {
        this.date = date;
    }

    public List<ShowtimeFormat> getFormats() {
        return formats;
    }
    public void setFormats(List<ShowtimeFormat> formats) {
        this.formats = formats;
    }
}
