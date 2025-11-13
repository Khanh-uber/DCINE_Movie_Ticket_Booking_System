package com.example.cinema.dto;

import java.util.List;

public class ShowtimeFormat {
    private String label;     // ví dụ: IMAX 2D, 3D, Standard
    private String lang;      // ví dụ: EN | VietSub
    private List<String> times;

    public String getLabel() {
        return label;
    }
    public void setLabel(String label) {
        this.label = label;
    }

    public String getLang() {
        return lang;
    }
    public void setLang(String lang) {
        this.lang = lang;
    }

    public List<String> getTimes() {
        return times;
    }
    public void setTimes(List<String> times) {
        this.times = times;
    }
}
