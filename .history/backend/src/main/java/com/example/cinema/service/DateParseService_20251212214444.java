package com.example.cinema.service;

@Service
public class DateParserService {

    public LocalDate parse(String text) {
        if (text == null) return LocalDate.now();

        String norm = text.toLowerCase().trim();

        if (norm.contains("hôm nay")) return LocalDate.now();
        if (norm.contains("mai")) return LocalDate.now().plusDays(1);

        // parse dd/MM
        try {
            DateTimeFormatter f = DateTimeFormatter.ofPattern("d/M");
            return LocalDate.parse(norm, f).withYear(LocalDate.now().getYear());
        } catch (Exception ignored) {}

        return LocalDate.now();
    }
}