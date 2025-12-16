package com.example.cinema.service;

import org.springframework.stereotype.Service;

import com.example.cinema.dto.ChatResponse;
import com.example.cinema.dto.MovieDTO;
import com.example.cinema.llm.IntentResult;
import com.example.cinema.llm.LLMReplyService;
import com.example.cinema.llm.LLMService;
import com.example.cinema.util.ReplyHelper;

import java.util.*;
@Service
public class ChatService {
    private final LLMService llmService;                // phân tích intent/entity
    private final ShowtimeService showtimeService;
    private final MovieService movieService;
    private final ReplyHelper replyHelper;
    private final LLMReplyService replyService;

    public ChatService(LLMService llmService, ShowtimeService showtimeService, MovieService movieService, ReplyHelper replyHelper, LLMReplyService replyService) {
        this.llmService = llmService;
        this.showtimeService = showtimeService;
        this.movieService = movieService;
        this.replyHelper = replyHelper;
        this.replyService = replyService;
    }
    private ChatResponse handleNowShowing(){
        List<MovieDTO> movies = movieService.getNowShowingMovies();
        String context = replyHelper.toMovieList(movies);
        
        String reply = replyService.reply(
            "hoi_phim_dang_chieu",
            context,
            "Hãy trả lời thật tự nhiên và thân thiện,ngắn gọn tối đa 2 dòng.nói rằng hiện tại rạp đang có nhiều phim đang chiếu.\r\n" + //
                                "Không được liệt kê tên phim hoặc mô tả chi tiết phim, vì danh sách sẽ được hiển thị phía dưới giao diện.\r\n" + //
                                "Chỉ tạo phần mở đầu mượt mà, mang giọng vui vẻ, genZ một chút."
        );
        return new ChatResponse(reply, movies);
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
    private ChatResponse handleByGenre(IntentResult.Entities entities){
        List<String> genres = entities.getGenre();
        if (genres == null || genres.isEmpty()) {
            return new ChatResponse("Bạn vui lòng cung cấp thể loại phim bạn quan tâm.");
        }

        List<MovieDTO> movies = movieService.getMoviesByGenre(genres);
        if (movies.isEmpty()) {
            return new ChatResponse("Hiện tại không có phim nào thuộc thể loại " + genres + ".");
        }

        return new ChatResponse("Các phim thuộc thể loại " + String.join(", ", genres) + ":", movies);
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
            case "hoi_phim_phu_hop":
                return handleSuitableMovies(e);    

            // case "hoi_danh_gia":
            //     return handleReview(e);

            // case "hoi_phim_phu_hop":
            //     return handleRecommendation(e);

            // case "hoi_suat_theo_phim":
            //     return handleMovieShowtime(e, userId);

            // case "hoi_suat_theo_rap":
            //     return handleTheaterShowtime(e, userId);

            // case "hoi_suat_theo_ngay":
            //     return handleShowtimeByDate(e, userId);

            // case "hoi_lich_chieu":
            //     return handleFullShowtime(e, userId);

            default:
                return new ChatResponse("Mình chưa hiểu câu hỏi này. Bạn có thể nói rõ hơn không?");
        }
    }
}
