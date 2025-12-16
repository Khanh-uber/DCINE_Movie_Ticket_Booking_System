package com.example.cinema.service;

import org.springframework.stereotype.Service;

import com.example.cinema.dto.ChatResponse;
import com.example.cinema.dto.MovieDTO;
import com.example.cinema.llm.IntentResult;
import com.example.cinema.llm.LLMService;
import java.util.*;
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
    private ChatResponse handleNowShowing(){
        List<MovieDTO> movies = movieService.getNowShowingMovies();
        if (movies.isEmpty()) {
            return new ChatResponse("Hiện tại không có phim nào đang chiếu.");
        }

        return new ChatResponse("Các phim đang chiếu hiện tại:", movies);
    }
    private ChatResponse handleUpcoming(){
        List<MovieDTO> movies = movieService.getComingSoonMovies();
        if (movies.isEmpty()) {
            return new ChatResponse("Hiện tại không có phim nào sắp chiếu.");
        }

        return new ChatResponse("Các phim sắp chiếu:", movies);
    }
    private ChatResponse handleHotMovies(){
        List<MovieDTO> movies = movieService.getHotMovies();
        if (movies.isEmpty()) {
            return new ChatResponse("Hiện tại không có phim hot nào.");
        }

        return new ChatResponse("Các phim hot hiện tại:", movies);
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
