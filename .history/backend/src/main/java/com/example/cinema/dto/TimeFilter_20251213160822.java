package com.example.cinema.dto;

public class TimeFilter {
    private LocalTime from;
    private LocalTime to;

    public TimeFilter(LocalTime from, LocalTime to) {
        this.from = from;
        this.to = to;
    }

    public LocalTime getFrom() { return from; }
    public LocalTime getTo() { return to; }
}
