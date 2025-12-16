package com.example.cinema.llm;

public class ConversationContext {

  
    private String movie;        // tên phim đang nói tới
    private String theater;      // rạp đang nói tới
    private String datePhrase;   // "hôm nay", "16/12", ...
    private String timePhrase;   // "tối", "19h30", ...

    // ===== NGỮ CẢNH PHỤ (OPTIONAL) =====
    private String location;     

    // ===== META =====
    private String lastIntent;   // intent gần nhất (để reset state khi cần)

    // ===== GETTER / SETTER =====
    public String getMovie() {
        return movie;
    }

    public void setMovie(String movie) {
        this.movie = movie;
    }

    public String getTheater() {
        return theater;
    }

    public void setTheater(String theater) {
        this.theater = theater;
    }

    public String getDatePhrase() {
        return datePhrase;
    }

    public void setDatePhrase(String datePhrase) {
        this.datePhrase = datePhrase;
    }

    public String getTimePhrase() {
        return timePhrase;
    }

    public void setTimePhrase(String timePhrase) {
        this.timePhrase = timePhrase;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getLastIntent() {
        return lastIntent;
    }

    public void setLastIntent(String lastIntent) {
        this.lastIntent = lastIntent;
    }

    // ===== RESET STATE =====
    public void clear() {
        this.movie = null;
        this.theater = null;
        this.datePhrase = null;
        this.timePhrase = null;
        this.location = null;
        this.lastIntent = null;
    }

    
    @Override
    public String toString() {
        return "ConversationContext{" +
                "movie='" + movie + '\'' +
                ", theater='" + theater + '\'' +
                ", datePhrase='" + datePhrase + '\'' +
                ", timePhrase='" + timePhrase + '\'' +
                ", location='" + location + '\'' +
                ", lastIntent='" + lastIntent + '\'' +
                '}';
    }
}
