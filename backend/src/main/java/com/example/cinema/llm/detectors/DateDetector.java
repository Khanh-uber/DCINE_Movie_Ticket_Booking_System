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

        // ====== RULE 1: EXACT "ngày mai" ======
        if (norm.contains("ngay mai")) 
            return "ngày mai";

        // ====== RULE 2: "mai" but NOT after "phim" ======
        // Tìm "phim <tên>" → không được detect date
        if (norm.matches(".*phim\\s+mai.*")) {
            return null; // đây là tên phim Mai — không phải date
        }

        // ====== RULE 3: "mai" đứng riêng, nghĩa là ngày mai ======
        if (norm.matches(".*\\bmai\\b.*"))
            return "ngày mai";

        // ====== RULE 4: hôm nay ======
        if (norm.contains("hom nay"))
            return "hôm nay";

        return null;
    }
}
