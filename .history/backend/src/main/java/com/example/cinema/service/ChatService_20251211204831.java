package com.example.cinema.service;

import org.springframework.stereotype.Service;

import com.example.cinema.dto.ChatResponse;
import com.example.cinema.llm.IntentResult;
import com.example.cinema.llm.LLMService;

@Service
public class ChatService {
    private final LLMService llmService;                // phân tích intent/entity
    private final ShowtimeService showtimeService;
    private final MovieService movieService;

    public ChatService(LLMService llmService, ShowtimeService showtimeService, MovieService movieService) {
        this.llmService = llmService;
        this.showtimeService = showtimeService;
        this.movieService = movieService;
    }
    public ChatResponse handleMessage(String message) {
        // 1) ⭐ PHÂN TÍCH INTENT + ENTITY QUA GROQ LLM
        IntentResult intentResult = llmService.analyzeIntent(message);
        String intentName = intentResult.getIntent();
        var e = intentResult.getEntities();


        switch (intentName) {

            case "hoi_phim_dang_chieu":
                return handleNowShowing();

            case "hoi_phim_sap_chieu":
                return handleUpcoming();

            case "hoi_phim_hot":
                return handleHotMovies();

            case "hoi_the_loai":
                return handleByGenre(e);

            case "hoi_danh_gia":
                return handleReview(e);

            case "hoi_phim_phu_hop":
                return handleRecommendation(e);

            case "hoi_suat_theo_phim":
                return handleMovieShowtime(e, userId);

            case "hoi_suat_theo_rap":
                return handleTheaterShowtime(e, userId);

            case "hoi_suat_theo_ngay":
                return handleShowtimeByDate(e, userId);

            case "hoi_lich_chieu":
                return handleFullShowtime(e, userId);

            default:
                return new ChatResponse("Mình chưa hiểu câu hỏi này. Bạn có thể nói rõ hơn không?");
        }

        // 3) TỔNG HỢP VÀ TRẢ VỀ KẾT QUẢ

        return new ChatResponse();
    }
}
