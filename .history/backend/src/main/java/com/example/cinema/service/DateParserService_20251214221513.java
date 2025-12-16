package com.example.cinema.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;

@Service
public class DateParserService {

    private static final Pattern DATE_DD_MM =
            Pattern.compile("\\b(\\d{1,2})[/-](\\d{1,2})\\b");

    private static final Pattern DATE_DD_MM_YYYY =
            Pattern.compile("\\b(\\d{1,2})[/-](\\d{1,2})[/-](\\d{2,4})\\b");
    private String normalize(String s) {
    if (s == null) return "";
    return java.text.Normalizer
        .normalize(s, java.text.Normalizer.Form.NFD)
        .replaceAll("\\p{M}", "")        // bỏ dấu
        .toLowerCase()
        .replaceAll("[^a-z0-9 ]", " ")   // ký tự lạ
        .replaceAll("\\s+", " ")
        .trim();
}
    public LocalDate parse(String text) {
        if (text == null) return LocalDate.now();

        String norm = normalize(text);

        // ====== 1) TỪ KHÓA NGÀY ĐƠN GIẢN ======
        if (norm.contains("hom nay")) return LocalDate.now();
        if (norm.contains("toi nay") || norm.contains("chieu nay") || norm.contains("sang nay"))
            return LocalDate.now();
        if (norm.contains("ngay kia") || norm.contains("mot"))
            return LocalDate.now().plusDays(2);

        // "mai" nhưng KHÔNG nằm trong "thứ hai"
        if (norm.matches(".*\\bmai\\b.*") && !norm.contains("thu hai"))
            return LocalDate.now().plusDays(1);

        

        // ====== 2) THỨ TRONG TUẦN ======
        DayOfWeek dow = parseDayOfWeek(norm);
        if (dow != null) {
            return nextWeekday(dow);
        }

        // ====== 3) NGÀY CỤ THỂ DD/MM/YYYY ======
        Matcher fullDate = DATE_DD_MM_YYYY.matcher(norm);
        if (fullDate.find()) {
            int d = Integer.parseInt(fullDate.group(1));
            int m = Integer.parseInt(fullDate.group(2));
            int y = Integer.parseInt(fullDate.group(3));
            if (y < 100) y += 2000; // xử lý 25 = 2025
            return safe(d, m, y);
        }

        // ====== 4) NGÀY CỤ THỂ DD/MM (mặc định năm hiện tại) ======
        Matcher shortDate = DATE_DD_MM.matcher(norm);
        if (shortDate.find()) {
            int d = Integer.parseInt(shortDate.group(1));
            int m = Integer.parseInt(shortDate.group(2));
            return safe(d, m, LocalDate.now().getYear());
        }

        // ====== 5) Không parse được → null======
        return null;
    }

    // Hỗ trợ parse "thứ 2, thứ hai, thu 3, t7, cn"
    private DayOfWeek parseDayOfWeek(String norm) {
        if (norm.contains("thu 2") || norm.contains("thu hai") || norm.matches(".*\\bt2\\b.*"))
            return DayOfWeek.MONDAY;
        if (norm.contains("thu 3") || norm.contains("thu ba") || norm.matches(".*\\bt3\\b.*"))
            return DayOfWeek.TUESDAY;
        if (norm.contains("thu 4") || norm.contains("thu tu") || norm.matches(".*\\bt4\\b.*"))
            return DayOfWeek.WEDNESDAY;
        if (norm.contains("thu 5") || norm.contains("thu nam") || norm.matches(".*\\bt5\\b.*"))
            return DayOfWeek.THURSDAY;
        if (norm.contains("thu 6") || norm.contains("thu sau") || norm.matches(".*\\bt6\\b.*"))
            return DayOfWeek.FRIDAY;
        if (norm.contains("thu 7") || norm.contains("thu bay") || norm.matches(".*\\bt7\\b.*"))
            return DayOfWeek.SATURDAY;
        if (norm.contains("chu nhật") || norm.contains("cn"))
            return DayOfWeek.SUNDAY;

        return null;
    }

    // Lấy ngày "thứ X" gần nhất (tuần này hoặc tuần sau)
    private LocalDate nextWeekday(DayOfWeek target) {
        LocalDate today = LocalDate.now();
        int diff = target.getValue() - today.getDayOfWeek().getValue();
        if (diff < 0) diff += 7;
        return today.plusDays(diff);
    }

    // Tránh lỗi ngày 31/2 → fallback về hôm nay
    private LocalDate safe(int d, int m, int y) {
        try {
            return LocalDate.of(y, m, d);
        } catch (Exception e) {
            return null;
        }
    }
}
