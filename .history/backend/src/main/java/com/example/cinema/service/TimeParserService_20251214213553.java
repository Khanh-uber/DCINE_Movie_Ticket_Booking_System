package com.example.cinema.service;

import java.time.LocalTime;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;

import com.example.cinema.dto.TimeFilter;

@Service
public class TimeParserService {
    private String normalize(String s) {
        if (s == null) return "";
        return java.text.Normalizer.normalize(s, java.text.Normalizer.Form.NFD)
            .replaceAll("\\p{M}", "")        // bỏ dấu
            .toLowerCase()
            .replaceAll("[^a-z0-9 ]", " ")   // ký tự lạ
            .replaceAll("\\s+", " ")
            .trim();
    }
    public TimeFilter parse(String time) {
        if (time == null || time.isBlank()) return null;

        String t = normalize(time.toLowerCase().trim());

        // ===== 1️⃣ BUỔI =====
        if (t.contains("sang")) {
            return new TimeFilter(
                LocalTime.of(6, 0),
                LocalTime.of(11, 59)
            );
        }
        if (t.contains("trua")) {
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
        Pattern p = Pattern.compile("(\\d{1,2})(?:[:h](\\d{1,2}))?");
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
    public static void main(String[] args) {
    TimeParserService svc = new TimeParserService();

    test(svc, "sáng");
    test(svc, "sang");
    test(svc, "sáng mai");
    test(svc, "toi");
    test(svc, "tối");
    test(svc, "tối mai");
    test(svc, "21h");
    test(svc, "21:00");
    test(svc, "9 rưỡi");
    test(svc, null);
    test(svc, "");
}

private static void test(TimeParserService svc, String input) {
    TimeFilter tf = svc.parse(input);
    System.out.println("Input = " + input);
    if (tf == null) {
        System.out.println("  -> TimeFilter = null");
    } else {
        System.out.println("  -> From = " + tf.getFrom()
                         + " | To = " + tf.getTo());
    }
    System.out.println("--------------------------------");
}
}
