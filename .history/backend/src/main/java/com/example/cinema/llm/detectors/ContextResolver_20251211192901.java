package com.example.cinema.llm.context;

import com.example.cinema.llm.models.IntentResult;
import com.example.cinema.llm.util.TextUtil;
import org.springframework.stereotype.Component;

@Component
public class ContextResolver {

    public void resolve(IntentResult ai, String msg) {

        String norm = TextUtil.normalize(msg);
        var e = ai.getEntities();

        String movie = e.getMovie();
        String date = e.getDate();

        if (movie == null || date == null) return;

        int movieScore = 0;
        int dateScore = 0;

        // --- Context scoring: movie ---
        if (contains(norm, "phim","suat","suat chieu","lich","xem","chiếu"))
            movieScore += 5;
        movieScore += 5; // vì detect được movie từ dictionary

        // --- Context scoring: date ---
        if (contains(norm, "hom nay","hôm nay","ngay mai","ngày mai","mai","tối","chiều"))
            dateScore += 4;

        dateScore += 3; // vì detect được date

        // --- If ambiguous (Mai vs mai) ---
        boolean ambiguous =
                TextUtil.normalize(movie)
                        .equals(TextUtil.normalize(date));

        if (ambiguous) {

            if (movieScore > dateScore) {
                // movie wins → drop ambiguous date "mai"
                e.setDate(null);
            } else {
                // date wins → drop movie
                e.setMovie(null);
            }
        }
    }

    private boolean contains(String t, String... keys) {
        for (String k : keys)
            if (t.contains(k)) return true;
        return false;
    }
}
