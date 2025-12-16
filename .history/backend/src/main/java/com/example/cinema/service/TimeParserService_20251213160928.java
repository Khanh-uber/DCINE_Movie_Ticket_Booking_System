package com.example.cinema.service;

import java.time.LocalTime;

import org.springframework.stereotype.Service;

import com.example.cinema.dto.TimeFilter;

@Service
public class TimeParserService {

    public TimeFilter parse(String time) {
        if (time == null || time.isBlank()) return null;

        String t = time.toLowerCase().trim();

        // ===== 1️⃣ BUỔI =====
        if (t.contains("sáng")) {
            return new TimeFilter(
                LocalTime.of(6, 0),
                LocalTime.of(11, 59)
            );
        }
        if (t.contains("trưa")) {
            return new TimeFilter(
                LocalTime.of(12, 0),
                LocalTime.of(13, 59)
            );
        }
        if (t.contains("chiều")) {
            return new TimeFilter(
                LocalTime.of(14, 0),
                LocalTime.of(17, 59)
            );
        }
        if (t.contains("tối")) {
            return new TimeFilter(
                LocalTime.of(18, 0),
                LocalTime.of(23, 59)
            );
        }
        if (t.contains("khuya")) {
            return new TimeFilter(
                LocalTime.of(22, 0),
                LocalTime.of(23, 59)
            );
        }

        // ===== 2️⃣ GIỜ CỤ THỂ =====
        Patter p = Pattern.compile("(\\d{1,2})(?:[:h](\\d{1,2}))?");
        Matcher m = p.matcher(t);

        if (m.find()) {
            int hour = Integer.parseInt(m.group(1));
            int minute = m.group(2) != null
                    ? Integer.parseInt(m.group(2))
                    : 0;

            LocalTime center = LocalTime.of(hour, minute);

            // Lọc ±30 phút
            return new TimeFilter(
                center.minusMinutes(30),
                center.plusMinutes(30)
            );
        }

        return null;
    }
}
