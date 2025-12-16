package com.example.cinema.llm.detectors;
import org.springframework.stereotype.Component;

@Component
public class DateDetector {

    public String detect(String msg) {
        String norm = TextUtil.normalize(msg);

        if (norm.contains("hom nay") || norm.contains("hôm nay"))
            return "hôm nay";

        if (norm.contains("ngay mai") || norm.contains("ngày mai"))
            return "ngày mai";

        if (norm.matches(".*\\bmai\\b.*"))
            return "ngày mai";

        return null;
    }
}
