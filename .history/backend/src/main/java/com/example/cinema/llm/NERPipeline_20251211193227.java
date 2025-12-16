package com.example.cinema.llm;

import com.example.cinema.llm.detectors.ContextResolver;
import com.example.cinema.llm.detectors.DateDetector;
import com.example.cinema.llm.detectors.MovieDetector;
import com.example.cinema.llm.IntentResult;
import org.springframework.stereotype.Component;

@Component
public class NERPipeline {

    private final MovieDetector movieDetector;
    private final DateDetector dateDetector;
    private final ContextResolver contextResolver;

    public NERPipeline(MovieDetector movieDetector,
                       DateDetector dateDetector,
                       ContextResolver contextResolver) {

        this.movieDetector = movieDetector;
        this.dateDetector = dateDetector;
        this.contextResolver = contextResolver;
    }

    public IntentResult correct(IntentResult ai, String msg) {

        // ===== TẦNG 1 — Raw detection =====
        String movie = movieDetector.detect(msg);
        if (movie != null)
            ai.getEntities().setMovie(movie);

        String date = dateDetector.detect(msg);
        if (date != null)
            ai.getEntities().setDate(date);

        // ===== TẦNG 3 — Context disambiguation =====
        contextResolver.resolve(ai, msg);

        return ai;
    }
}
