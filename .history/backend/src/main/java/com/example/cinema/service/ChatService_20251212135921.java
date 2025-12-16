package com.example.cinema.service;

import org.springframework.stereotype.Service;

import com.example.cinema.dto.ChatResponse;
import com.example.cinema.dto.MovieDTO;
import com.example.cinema.llm.IntentResult;
import com.example.cinema.llm.LLMReplyService;
import com.example.cinema.llm.LLMService;
import com.example.cinema.util.ReplyHelper;
import com.fasterxml.jackson.databind.ObjectMapper;

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
    private ChatResponse handleUpcoming() {
    // 1) Lấy danh sách phim sắp chiếu từ hệ thống
    List<MovieDTO> movies = movieService.getComingSoonMovies();

    // Chuẩn bị context JSON gửi cho LLM
    String context;
    try {
        context = new ObjectMapper().writeValueAsString(movies);
    } catch (Exception e) {
        context = "[]";
    }

    // 2) Nếu không có phim nào → để LLM trả lời theo instruction
    if (movies == null || movies.isEmpty()) {

        String instruction = """
            Không có phim sắp chiếu nào trong hệ thống. 
            Hãy trả lời ngắn gọn, tự nhiên và thân thiện. 
            Gợi ý người dùng có thể hỏi phim đang chiếu hoặc phim hot.
        """;

        String reply = replyService.reply(
                "hoi_phim_sap_chieu",
                context,
                instruction
        );

        return new ChatResponse(reply);
    }

    // 3) Nếu có phim → yêu cầu LLM tóm tắt
    String instruction = """
        Dưới đây là danh sách phim sắp chiếu của D-Cine (context).
        Hãy viết câu trả lời ngắn gọn (1–2 câu), vui vẻ, tự nhiên:
        - Mở đầu bằng một câu giới thiệu hào hứng rằng sắp có phim mới.
        - KHÔNG liệt kê tên phim và KHÔNG mô tả nội dung phim.
        - Vì danh sách phim sẽ được hiển thị trong giao diện, bạn chỉ cần nói chung chung.
        - Cuối câu gợi ý nhẹ nhàng kiểu: “Bạn muốn xem chi tiết phim nào không?”
        - Không được bịa thêm phim, ngày chiếu, hay thông tin không có trong context.
        """;

    String reply = replyService.reply(
            "hoi_phim_sap_chieu",
            context,
            instruction
    );

    return new ChatResponse(reply, movies);
}

    private ChatResponse handleHotMovies() {
    // 1) Lấy danh sách phim hot từ hệ thống
    List<MovieDTO> movies = movieService.getHotMovies(); // hoặc getTrendingMovies()

    // 2) Convert context gửi cho LLM
    String context;
    try {
        context = new ObjectMapper().writeValueAsString(movies);
    } catch (Exception e) {
        context = "[]";
    }

    // 3) Nếu không có phim hot → fallback
    if (movies == null || movies.isEmpty()) {

        String instruction = """
            Hiện tại hệ thống chưa cập nhật danh sách phim đang hot.
            Hãy trả lời ngắn, vui vẻ và gợi ý người dùng xem phim đang chiếu
            hoặc hỏi về phim sắp chiếu.
        """;

        String reply = replyService.reply(
                "hoi_phim_hot",
                context,
                instruction
        );

        return new ChatResponse(reply);
    }

    // 4) Nếu có phim hot → yêu cầu LLM trả lời header
    String instruction = """
        Đây là danh sách phim hot (đang được quan tâm nhiều nhất) của D-Cine — xem trong context.
        
        Hãy tạo câu trả lời:
        - Ngắn gọn (1–2 câu), thân thiện, đùa cợt ăn chơi một chút.
        - KHÔNG liệt kê tên phim, vì danh sách sẽ được hiển thị trong giao diện.
        - Có thể nói dạng: “D-Cine đang cực kỳ sôi động với nhiều phim hot tuần này!”
        - Cuối câu gợi ý người dùng chọn xem chi tiết phim nào.
        - Không được bịa thêm thông tin không có trong context.
        """;

    String reply = replyService.reply(
            "hoi_phim_hot",
            context,
            instruction
    );

    return new ChatResponse(reply, movies);
}

    private ChatResponse handleByGenre(IntentResult.Entities e) {

    // 1) Lấy list genre user yêu cầu (LLM trả dạng List<String>)
    List<String> genres = e.getGenre();

    // 2) Nếu không có genre nào hợp lệ → yêu cầu thêm thông tin
    if (genres.isEmpty()) {

        String instruction = """
            Người dùng muốn tìm phim theo thể loại nhưng không cung cấp thể loại hợp lệ.
            Hãy trả lời ngắn gọn, thân thiện và gợi ý họ nói rõ thể loại, 
            ví dụ: "phim kinh dị", "phim hoạt hình", "phim lãng mạn".
        """;

        String reply = replyService.reply(
                "hoi_the_loai",
                "[]",
                instruction
        );

        return new ChatResponse(reply);
    }

    // 3) Query database tìm phim theo genre
    List<MovieDTO> movies = movieService.getMoviesByGenre(genres);

    String context;
    try {
        context = new ObjectMapper().writeValueAsString(movies);
    } catch (Exception ex) {
        context = "[]";
    }

    // 4) Nếu không có phim → LLM trả lời fallback
    if (movies.isEmpty()) {

        String instruction = """
            Không tìm thấy phim nào thuộc thể loại người dùng yêu cầu.
            Hãy trả lời lịch sự và gợi ý họ thử một thể loại khác.
        """;

        String reply = replyService.reply(
                "hoi_the_loai",
                context,
                instruction
        );

        return new ChatResponse(reply);
    }

    // 5) Nếu có phim → yêu cầu LLM tạo header trả lời
    String genreText = String.join(", ", genres);

    String instruction = """
        Đây là các phim thuộc thể loại người dùng yêu cầu: %s.
        Hãy trả lời:
        - Ngắn gọn (1–2 câu), vui vẻ.
        - KHÔNG liệt kê tên phim (vì giao diện sẽ hiển thị).
        - Có thể giới thiệu nhẹ để người dùng cảm thấy thú vị.
        - Cuối câu gợi ý: “Bạn muốn xem chi tiết phim nào không?”
        - Không được thêm thông tin ngoài context.
        """.formatted(genreText);

    String reply = replyService.reply(
            "hoi_the_loai",
            context,
            instruction
    );

    return new ChatResponse(reply, movies);
}

    private ChatResponse handleSuitableMovies(IntentResult.Entities e){
        // 1) Lấy mood mà LLM trích xuất
        List<String> moods = e.getMood() != null ? e.getMood() : List.of();
        if (moods == null || moods.isEmpty()) {
            return new ChatResponse("Bạn vui lòng cung cấp tâm trạng hoặc sở thích của bạn.");
        }

        List<MovieDTO> movies = movieService.getMoviesByGenre(moods);
        if (movies.isEmpty()) {
            return new ChatResponse("Hiện tại không có phim nào phù hợp với tâm trạng hoặc sở thích " + moods + ".");
        }

        return new ChatResponse("Các phim phù hợp với tâm trạng hoặc sở thích " + String.join(", ", moods) + ":", movies);
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
