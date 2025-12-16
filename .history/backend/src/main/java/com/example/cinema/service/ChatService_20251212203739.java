package com.example.cinema.service;

import org.springframework.stereotype.Service;

import com.example.cinema.dto.ChatResponse;
import com.example.cinema.dto.MovieDTO;
import com.example.cinema.entity.Movie;
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
    private final MovieLookupService movieLookupService;

    public ChatService(LLMService llmService, ShowtimeService showtimeService, MovieService movieService, ReplyHelper replyHelper, LLMReplyService replyService, MovieLookupService movieLookupService) {
        this.llmService = llmService;
        this.showtimeService = showtimeService;
        this.movieService = movieService;
        this.replyHelper = replyHelper;
        this.replyService = replyService;
        this.movieLookupService = movieLookupService;   
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
             String instruction = """
            Người dùng muốn tìm phim theo tâm trạng, 
            nhưng không rõ tâm trạng thuộc loại nào.
            Hãy trả lời thân thiện, gợi ý họ mô tả cụ thể hơn,
            ví dụ: "buồn", "vui", "căng thẳng", "nhẹ nhàng"...
        """;

            String reply = replyService.reply(
                    "hoi_phim_phu_hop",
                    "[]",
                    instruction
            );
            return new ChatResponse(reply);
        }

        // 3) Query phim theo genre đã map
    List<MovieDTO> movies = movieService.getMoviesByGenre(e.getGenre());

    String context;
    try {
        context = new ObjectMapper().writeValueAsString(movies);
    } catch (Exception ex) {
        context = "[]";
    }

    // 4) Nếu không có phim hợp mood → fallback
    if (movies.isEmpty()) {

        String instruction = """
            Không tìm thấy phim nào phù hợp với mood của người dùng.
            Hãy đưa ra lời khuyên nhẹ nhàng và đề xuất họ chọn mood khác.
        """;

        String reply = replyService.reply(
                "hoi_phim_phu_hop",
                context,
                instruction
        );

        return new ChatResponse(reply);
    }

    // 5) Nếu có phim → LLM viết câu trả lời vui vẻ
    String moodText = moods.isEmpty() ? "tâm trạng hiện tại" : String.join(", ", moods);

    String instruction = """
        Người dùng đang ở mood: %s.
        Đây là danh sách phim phù hợp theo mood đó.
        Hãy viết câu trả lời:
        - Ngắn gọn (1–2 câu), vui vẻ, thân thiện.
        - KHÔNG liệt kê tên phim (FE sẽ hiển thị).
        - Tạo cảm giác được gợi ý cá nhân hoá.
        - Cuối câu hỏi người dùng muốn xem chi tiết phim nào.
        """.formatted(moodText);

    String reply = replyService.reply(
            "hoi_phim_phu_hop",
            context,
            instruction
    );

    // FE sẽ render list phim
    return new ChatResponse(reply, movies);
    }
    private ChatResponse handleReview(IntentResult.Entities e) {

        // 1. Lấy movie từ NER
        String movieTitle = e.getMovie();
        System.out.println("Movie title extracted: " + movieTitle);
        // 1.1 Nếu người dùng chưa nói tên phim → hỏi lại
        if (movieTitle == null || movieTitle.isBlank()) {
            String instruction = """
                Người dùng muốn xem đánh giá phim nhưng chưa nói tên phim.
                Hãy trả lời thân thiện:
                - Nhắc rằng bạn cần tên phim để đánh giá.
                - Đùa nhẹ một câu cho dễ thương.
            """;

            String reply = replyService.reply(
                    "hoi_danh_gia",
                    "{}",
                    instruction
            );

            return new ChatResponse(reply, null);
        }
        // 3. Lấy thông tin phim từ DB
        MovieDTO movieDTO = movieLookupService.findMovie(movieTitle);

        if (movieDTO == null) {
            // phim không tồn tại trong hệ thống
            String instruction = """
                Không tìm thấy phim người dùng yêu cầu trong hệ thống.
                Hãy trả lời thân thiện:
                - Xin lỗi vì không tìm thấy phim bạn yêu cầu.
                - Gợi ý người dùng kiểm tra lại tên.
            """;

            String reply = replyService.reply(
                    "hoi_danh_gia",
                    "{}",
                    instruction
            );
            
            return new ChatResponse(reply, null);
        }

        // 4. Chuẩn bị context gửi cho LLM
        Map<String, Object> ctx = new HashMap<>();
ctx.put("title", movieDTO.getTitle());
ctx.put("rating", movieDTO.getRating());
ctx.put("genres", movieDTO.getGenres());
ctx.put("posterUrl", movieDTO.getPosterUrl());

        String context;
        try {
            context = new ObjectMapper().writeValueAsString(ctx);
        } catch (Exception ex) {
            context = "{}";
        }

        // 5. Instruction cho LLM tạo câu trả lời
        String instruction = """
            Bạn *LUÔN LUÔN* phải trả lời đánh giá dựa trên dữ liệu trong context.
            KHÔNG ĐƯỢC nói rằng không có thông tin, không có dữ liệu hoặc không tìm thấy.
            
            Nếu context ít thông tin:
            - Hãy nhận xét nhẹ nhàng dựa trên title, rating, genre.
            - Hãy thêm câu gợi ý liên quan đến suất chiếu

            YÊU CẦU:
            - 2–3 câu.
            - Giọng vui vẻ, thân thiện.
            - Không bịa chi tiết không nằm trong context.
        """;

        String reply = replyService.reply(
                "hoi_danh_gia",
                context,
                instruction
        );

        // 6. FE sẽ hiển thị poster, trailer, rating ở phần dưới
        return new ChatResponse(reply, movieDTO);
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

            case "hoi_danh_gia":
                return handleReview(e);

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
