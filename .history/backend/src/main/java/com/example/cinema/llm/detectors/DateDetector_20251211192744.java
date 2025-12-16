package com.example.cinema.llm.detectors;
import java.text.Normalizer;

import org.springframework.stereotype.Component;

@Component
public class DateDetector {

    private String normalize(String text) {
        if (text == null) return "";

        // 1) Bỏ dấu tiếng Việt
        String noAccents = Normalizer.normalize(text, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace("đ", "d")
                .replace("Đ", "D");

        // 2) Lowercase + trim
        return noAccents.toLowerCase().trim();
    }
    public String detect(String msg) {
        String norm = normalize(msg);

        if (norm.contains("hom nay") || norm.contains("hôm nay"))
            return "hôm nay";

        if (norm.contains("ngay mai") || norm.contains("ngày mai"))
            return "ngày mai";

        if (norm.matches(".*\\bmai\\b.*"))
            return "ngày mai";

        return null;
    }
}
