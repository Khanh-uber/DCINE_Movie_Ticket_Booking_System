package com.example.cinema.service;

import org.springframework.stereotype.Service;

import com.example.cinema.dto.ChatResponse;
import com.example.cinema.dto.MovieDTO;
import com.example.cinema.dto.ShowtimeDTO;
import com.example.cinema.dto.ShowtimeFlatDTO;
import com.example.cinema.dto.TheaterDTO;
import com.example.cinema.dto.TimeFilter;
import com.example.cinema.entity.Movie;
import com.example.cinema.llm.ConversationContext;
import com.example.cinema.llm.IntentResult;
import com.example.cinema.llm.LLMReplyService;
import com.example.cinema.llm.LLMService;
import com.example.cinema.repository.ShowTimeRepository;
import com.example.cinema.util.FormatShowtimes;
import com.example.cinema.util.ReplyHelper;
import com.fasterxml.jackson.databind.ObjectMapper;



import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
@Service
public class ChatService {
    private final LLMService llmService;                // phân tích intent/entity
    private final ShowtimeService showtimeService;
    private final MovieService movieService;
    private final ReplyHelper replyHelper;
    private final LLMReplyService replyService;
    private final MovieLookupService movieLookupService;
    private final DateParserService dateParserService;
    private final FormatShowtimes formatShowtimes;
    private final TheaterLookupService theaterLookupService;
    private final ObjectMapper objectMapper;
    private final ShowTimeRepository showTimeRepo;
    private final TimeParserService timeParserService;
    private final MemoryService memoryService;

    public ChatService(LLMService llmService, ShowtimeService showtimeService, MovieService movieService, ReplyHelper replyHelper, LLMReplyService replyService, MovieLookupService movieLookupService,
        DateParserService dateParserService, TheaterLookupService theaterLookupService, FormatShowtimes formatShowtimes, ObjectMapper objectMapper, MemoryService memoryService, ShowTimeRepository showTimeRepo, TimeParserService timeParserService) {
        this.llmService = llmService;
        this.showtimeService = showtimeService;
        this.movieService = movieService;
        this.replyHelper = replyHelper;
        this.replyService = replyService;
        this.movieLookupService = movieLookupService;   
        this.dateParserService = dateParserService;
        this.formatShowtimes = formatShowtimes;
        this.theaterLookupService = theaterLookupService;
        this.objectMapper = objectMapper;
        this.showTimeRepo = showTimeRepo;
        this.timeParserService = timeParserService;
        this.memoryService = memoryService;
        
    }
    private String safe(String s) {
        return s == null ? "" : s.trim();
    }
    private String safeJson(Object obj) {
        if (obj == null) return "{}";
        try {
            String json = objectMapper.writeValueAsString(obj);
            System.out.println("[LLM CONTEXT] " + json);
            return json;
        } catch (Exception e) {
            System.err.println("[safeJson] JSON error: " + e.getMessage());
            return "{}";
        }
    }
    private ChatResponse handleNowShowing(){
        List<MovieDTO> movies = movieService.getNowShowingMovies();
        String context = replyHelper.toMovieList(movies);
        
        String reply = replyService.reply(
            "hoi_phim_dang_chieu",
            context,
            """
            Bạn là chuyên gia gợi ý xem phim với phong cách rủ rê, thân mật và "chất chơi" của D-Cine.

            GIỌNG ĐIỆU:
            - Dùng ngôn ngữ GenZ, sôi động: "lên kèo", "quẩy", "cháy máy", "siêu cuốn", "nhức nách".
            - Sử dụng emoji hào hứng (🔥, 🍿, 🎬, 😎).

            YÊU CẦU NỘI DUNG (Tối đa 2 câu):
            1. Thông báo rạp đang có cả một "kho bom tấn" đang công phá màn ảnh.
            2. TUYỆT ĐỐI KHÔNG liệt kê tên phim hay mô tả nội dung (vì danh sách card phim đã hiển thị bên dưới).
            3. Kêu gọi hành động: Mời người dùng lướt xuống, chọn ngay một "em" phim ưng ý để "chốt đơn" đi xem liền.
        """
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
        ctx.put("cast", movieDTO.getCast());
        ctx.put("description", movieDTO.getSynopsis());

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
    public ChatResponse handleTheaterShowtime(IntentResult.Entities e) {
        String theaterText = e.getTheater();
        String dateText = e.getDate_phrase();
        System.out.println("[SuatTheoRap] theater extracted = " + theaterText);
        System.out.println("[SuatTheoRap] date extracted = " + dateText);

        // thieu theater, hoi lai
        if (theaterText == null || theaterText.isBlank()) {

            String instruction = """
                Người dùng muốn hỏi suất chiếu theo rạp nhưng chưa nói tên rạp cụ thể.
                Hãy hỏi lại thân thiện:
                - Xin tên rạp (ví dụ: CGV Thủ Đức, D-Cine Bến Thành,...)
                - Nếu người dùng chỉ nói khu vực (Thủ Đức, Gò Vấp...) thì hỏi: "Bạn muốn rạp nào ở khu vực đó?"
            """;

            String reply = replyService.reply(
                    "hoi_suat_theo_rap",
                    "{}",
                    instruction
            );

            return new ChatResponse(reply);
        }
        // 2 lookup theater trong db 
        TheaterDTO theater = theaterLookupService.findTheater(theaterText);
        if (theater == null) {

            Map<String, Object> ctxMap = new HashMap<>();
            ctxMap.put("theater_input", theaterText);

            String ctx = safeJson(ctxMap);

            String instruction = """
                Không tìm thấy rạp người dùng yêu cầu trong hệ thống.
                Hãy trả lời thân thiện:
                - Xin lỗi vì không tìm thấy rạp đó.
                - Gợi ý người dùng kiểm tra lại tên rạp.
                - Có thể đưa ví dụ: "CGV Thủ Đức", "D-Cine Bến Thành"...
            """;

            String reply = replyService.reply(
                    "hoi_suat_theo_rap",
                    ctx,
                    instruction
            );

        return new ChatResponse(reply, null);
    }
        
        // 3) parse date (default: hom nay)
        LocalDate date = (dateText == null || dateText.isBlank())
            ? LocalDate.now()
            : dateParserService.parse(dateText);
        
        // 4) query suat chieu theo rap + ngay
        List<ShowtimeFlatDTO> showtimes = showtimeService.getShowtimesByTheaterAndDate(theater.getId(), date);
        if (showtimes == null || showtimes.isEmpty()) {

            Map<String, Object> ctxMap = new HashMap<>();
            ctxMap.put("theater", theater.getName());
            ctxMap.put("date", dateText != null ? dateText : "hôm nay");

            String ctx = safeJson(ctxMap);

            String instruction = """
                Không có suất chiếu nào tại rạp trong ngày người dùng hỏi.
                Hãy trả lời:
                - Thông báo không có suất.
                - Gợi ý người dùng thử "ngày mai" hoặc rạp khác.
                - Giọng thân thiện, ngắn gọn.
        """;

            String reply = replyService.reply(
                    "hoi_suat_theo_rap",
                    ctx,
                    instruction
            );

            return new ChatResponse(reply);
        }
        // 5) Có showtimes -> context cho LLM
        Map<String, Object> ctx = new HashMap<>();
        ctx.put("theater", theater.getName());
        ctx.put("date", (dateText != null && !dateText.isBlank()) ? dateText : "hôm nay");
        ctx.put("count", showtimes.size());
        ctx.put("showtimes", showtimes); 
        String context = safeJson(ctx);

        String instruction = """
            Đây là danh sách suất chiếu theo rạp trong context.
            Hãy trả lời thân thiện:
            - Mở đầu báo rạp còn suất trong ngày đó.
            - Có thể nói "mình thấy có khoảng {count} suất" (nếu có count).
            - Gợi ý user: "Bạn muốn lọc theo phim nào không?"
            - Không bịa dữ liệu ngoài context.
        """;

        String reply = replyService.reply("hoi_suat_theo_rap", context, instruction);

    return new ChatResponse(reply, showtimes);
        
    }
    public ChatResponse handleFullShowtime(IntentResult.Entities e) {
        String movieText   = e.getMovie();
        String theaterText = e.getTheater();
        String dateText    = e.getDate_phrase();
        String locationText = e.getLocation();
        System.out.println("movie chua chuan hoa"+ movieText);
        System.out.println("theaterText chua chuan hoa"+ theaterText);
        System.out.println("dateText chua chuan hoa"+dateText);
        // Thiếu movie
        if (movieText == null  || movieText.isBlank()){
            String instruction = """
                Bạn là chuyên gia gợi ý xem phim với phong cách rủ rê, thân mật, đùa cợt và ăn chơi của D-Cine.

                GIỌNG ĐIỆU:
                - Bắt buộc dùng các từ lóng: "cưng", "lên kèo", "quẩy", "siêu cuốn", "nhức nách".
                - Sử dụng emoji liên quan đến rạp phim/vui vẻ (🍿, 😉).

                NỘI DUNG:
                1. Nhắc nhở người dùng bằng giọng đùa cợt rằng bạn cần tên phim cụ thể để tìm lịch chiếu.
                2. SỬ DỤNG các Entity đã có (theater và date từ Context JSON, nếu có) để cá nhân hóa câu hỏi. Ví dụ: "Tìm suất chiếu [tên rạp] vào [ngày] cho phim nào cưng?"
                3. Yêu cầu người dùng cung cấp tên phim để tiếp tục.
            """;
            String reply = replyService.reply(
                    "hoi_co_chieu",
                    "{}",
                    instruction
            );
            return new ChatResponse(reply);
        }
        MovieDTO movie = movieLookupService.findMovie(movieText);
        
        if (movie == null) {
            String instruction = """
                Bạn là chuyên gia gợi ý xem phim với phong cách rủ rê, thân mật, đùa cợt và ăn chơi của D-Cine.

                GIỌNG ĐIỆU:
                - Bắt buộc dùng giọng ăn chơi, thân mật, hơi lầy lội (cưng, lên kèo, xõa, cháy).
                - Sử dụng emoji thể hiện sự bối rối/tiếc nuối nhẹ (🤔, 🤯, 😅).

                NỘI DUNG:
                1. Thông báo kết quả: Nhắc lại tên phim người dùng yêu cầu (từ Context) và xác nhận rằng hệ thống chưa thấy phim đó.
                2. Tuyệt đối KHÔNG DÙNG từ "Xin lỗi" hay "lịch sự". Thay bằng một lời diễn giải hài hước: "Phim này chưa có lịch chiếu/chưa ra rạp" HOẶC "Tên phim này hơi lạ nha cưng!".
                3. Kêu gọi hành động: Gợi ý người dùng kiểm tra lại tên phim hoặc đổi sang một bộ phim đang "cháy" rạp khác để "lên kèo" ngay.
            """;

            String reply = replyService.reply(
                    "hoi_co_chieu",
                    "{}",
                    instruction
            );

            return new ChatResponse(reply);
        }
        System.out.println("MOVIEID:" + movie.getId());
        LocalDate date = dateParserService.parse(dateText);

        System.out.println("DATETEXT CHUAN HOA:" + date);

        // =====================================================
        // CHUẨN HOÁ RẠP (THIẾU / KHÔNG MATCH → ALL)
        // =====================================================
        TheaterDTO theater = theaterLookupService.findTheater(theaterText, locationText);
        Long theaterId = (theater != null) ? theater.getId() : null;
        

        // =====================================================
        // CHUẨN HÓA GIỜ CHIẾU
        // =====================================================
        TimeFilter timeFilter = timeParserService.parse(e.getTime_phrase(), e.getDate_phrase());
        
        
        LocalTime fromTime = timeFilter != null ? timeFilter.getFrom() : null;
        LocalTime toTime   = timeFilter != null ? timeFilter.getTo()   : null;

        System.out.println("FROMTIME" + fromTime);
        System.out.println("TOTIME" + toTime);
        
        // =====================================================
        // 5️⃣ QUERY LỊCH CHIẾU (THEO ID)
        // =====================================================
        List<Map<String, Object>> rows = showTimeRepo.findShowtimesByMovieTheaterDate(
            movie.getId(),
            theaterId,
            date,
            fromTime,
            toTime
        );
        // for (Map<String, Object> r : rows)
        List<ShowtimeFlatDTO> showtimes = new ArrayList<>();

        for (Map<String, Object> row : rows) {

            ShowtimeFlatDTO dto = new ShowtimeFlatDTO();

            // ===== chỉ cần cho chatbot =====
            dto.setTheaterName((String) row.get("theaterName"));

            Object startObj = row.get("startAt");
            if (startObj instanceof java.sql.Timestamp ts) {
                dto.setStartAt(ts.toLocalDateTime());
            } else if (startObj instanceof LocalDateTime ldt) {
                dto.setStartAt(ldt);
            }

            showtimes.add(dto);
        }

        // =====================================================
        // 6️⃣ KHÔNG CÓ LỊCH
        // =====================================================
        if (showtimes.isEmpty()) {
            String instruction = """
                Bạn là chuyên gia gợi ý xem phim với phong cách rủ rê, thân mật, đùa cợt và ăn chơi của D-Cine.

            GIỌNG ĐIỆU:
            - Bắt buộc dùng các từ lóng: "cưng", "lên kèo", "xõa", "cháy", "nhức nách".
            - Sử dụng emoji thể hiện sự tiếc nuối nhẹ (😥, 💔, hoặc 😉 để rủ rê).

            NỘI DUNG:
            1. Thông báo kết quả: Nhắc lại tên phim và ngày yêu cầu (từ Context) và xác nhận rằng KHÔNG có suất chiếu nào phù hợp.
            2. Tuyệt đối KHÔNG DÙNG từ "Xin lỗi" hay "lịch sự". Thay bằng cụm từ thể hiện sự tiếc nuối thân mật: "Ái chà, ...!" hoặc "Tiếc quá!".
            3. Kêu gọi hành động: Gợi ý người dùng thử ngay các mốc thời gian khác (ngày mai, cuối tuần) hoặc thử tìm suất chiếu cho một bộ phim đang "cháy" rạp khác.
            """;

            return new ChatResponse(
                replyService.reply("hoi_co_chieu", "{}", instruction)
            );
        }
        
        // 7️⃣ GROUP THEO RẠP → GIỜ CHIẾU
        // =====================================================
        int LIMIT_PER_THEATER = 3;
        int LIMIT_THEATER = 3;
        Map<String, List<String>> byTheater = new LinkedHashMap<>();

        for (ShowtimeFlatDTO dto : showtimes) {
            String tName = dto.getTheaterName();
            String time  = dto.getStartAt().toLocalTime().toString(); // HH:mm

            if (!byTheater.containsKey(tName) && byTheater.size() >= LIMIT_THEATER) {
                continue;
            }
            List<String> times =
                    byTheater.computeIfAbsent(tName, k -> new ArrayList<>());
            if (times.size() < LIMIT_PER_THEATER) {
                times.add(time);
            }
        }

        // =====================================================
        // 8️⃣ BUILD CONTEXT CHO LLM
        // =====================================================
        Map<String, Object> context = new HashMap<>();
        context.put("movie", movie.getTitle());
        if (date != null) {
            context.put("date", date.toString());
        } else {
            context.put("date", "");
        }
        context.put("showtimes_by_theater", byTheater);

        String instruction = """
            Bạn là chuyên gia gợi ý, trợ lí ăn chơi xem phim với phong cách rủ rê, thân mật, đùa cợt và ăn chơi của D-Cine.

            GIỌNG ĐIỆU:
            - Bắt buộc dùng các từ lóng: "cưng", "lên kèo", "xõa", "siêu cuốn", "cháy", "nhức nách".
            - Văn nói tự nhiên, thân mật.
            - Sử dụng emoji vui vẻ, liên quan đến xem phim (🔥, 🍿, 😉).

            CÁCH HIỂU NGỮ CẢNH:
            - Nếu Context.date KHÔNG rỗng: người dùng đang hỏi lịch chiếu vào một ngày CỤ THỂ.
            - Nếu Context.date rỗng: người dùng đang hỏi CHUNG (có chiếu không / các suất đang chiếu), KHÔNG ĐƯỢC tự suy diễn là "hôm nay".

            YÊU CẦU NỘI DUNG:
            1. MỞ ĐẦU:
            - Xác nhận tên phim từ Context.movie.
            - Nếu Context.date KHÔNG rỗng: nhắc rõ ngày chiếu (ví dụ: "hôm nay", "ngày mai", hoặc ngày cụ thể).
            - Nếu Context.date rỗng: dùng các cụm như "trong thời gian sắp tới", "hiện đang chiếu".
            2. TRÌNH BÀY LỊCH CHIẾU:
            - Dựa hoàn toàn vào Context.showtimes_by_theater.
            - Mỗi rạp là một đầu mục.
            - Dưới mỗi rạp, liệt kê các suất chiếu theo thứ tự thời gian.
            Nếu số lượng rạp hoặc suất chiếu nhiều:
                - Chỉ liệt kê một số rạp tiêu biểu (theo Context.showtimes_by_theater).
                - KHÔNG liệt kê tất cả.
                - Cuối câu phải gợi ý người dùng hỏi thêm để xem rạp hoặc ngày khác.
        """;

        String reply = replyService.reply(
            "hoi_co_chieu",
            safeJson(context),
            instruction
        );

    return new ChatResponse(reply);
    }
    public ChatResponse handleMovieShowtime(IntentResult.Entities e) {
        String movieText = e.getMovie();
        String dateText = e.getDate_phrase();
        String timeText = safe(e.getTime_phrase());
        String theaterText = e.getTheater();
        // 1) Thiếu movie hỏi lại
        if (movieText == null || movieText.isBlank()) {

            String instruction = """
                Bạn là chuyên gia gợi ý xem phim với phong cách rủ rê, thân mật, đùa cợt và ăn chơi của D-Cine.

                GIỌNG ĐIỆU:
                - Bắt buộc dùng các từ lóng: "cưng", "lên kèo", "quẩy", "cháy".
                - Sử dụng emoji thể hiện sự nhiệt tình và thắc mắc (🍿, 😉).

                NỘI DUNG:
                1. Nhắc nhở người dùng bằng giọng đùa cợt rằng bạn cần tên phim cụ thể.
                2. SỬ DỤNG các Entity đã có (date, theater từ Context) để cá nhân hóa câu hỏi. Ví dụ: "Tui có thể tìm suất chiếu tại [Tên Rạp] vào [Ngày] rồi, nhưng phim nào mới được chứ?"
                3. Hỏi lại một cách rủ rê: "Bạn muốn tìm giờ chiếu của phim nào để tui [Tên Chatbot] lên kèo cho bạn?"
            """;

            String reply = replyService.reply(
                    "hoi_gio_chieu_phim",
                    "{}",
                    instruction
            );

            return new ChatResponse(reply);
        }
        MovieDTO movie = movieLookupService.findMovie(movieText);
        if (movie == null) {
            String instruction = """
                GIỌNG ĐIỆU:
            - Bắt buộc dùng giọng ăn chơi, thân mật, hơi lầy lội (cưng, lên kèo, xõa, cháy).
            - Sử dụng emoji thể hiện sự bối rối/tiếc nuối nhẹ (🤔, 😅, 💔).

            NỘI DUNG:
            1. Thông báo kết quả: Nhắc lại tên phim người dùng yêu cầu ("%s") và xác nhận rằng hệ thống chưa thấy phim đó.
            2. Tuyệt đối KHÔNG DÙNG từ "Xin lỗi" hay "lịch sự". Thay bằng một lời diễn giải hài hước. 
            3. Kêu gọi hành động: Gợi ý người dùng kiểm tra lại tên phim hoặc đổi sang một bộ phim đang "cháy" rạp khác để "lên kèo" ngay.
            """.formatted(movieText);

            String reply = replyService.reply(
                    "hoi_gio_chieu_phim",
                    "{}",
                    instruction
            );

            return new ChatResponse(reply);
        }

        // 3) parse date
        LocalDate date = dateParserService.parse(dateText);
        // if (date == null && timeText != null) {
        //     date = dateParserService.parse(timeText);
        // }
        System.out.println("DATE CHUAN HOA:" + date);
        
        // 4) parse theater
        TheaterDTO theater = theaterLookupService.findTheater(theaterText);
        Long theaterId = (theater != null) ? theater.getId() : null;

        // 5) parse time
        TimeFilter tf = timeParserService.parse(timeText);
        LocalTime fromTime = (tf != null) ? tf.getFrom() : null;
        LocalTime toTime   = (tf != null) ? tf.getTo()   : null;

        //6) query suat chieu
        List<Map<String, Object>> rows = showTimeRepo.findShowtimesByMovieTheaterDate(
            movie.getId(),
            theaterId,
            date,
            fromTime,
            toTime
        );

        // 7) khong co suat chieu
        if (rows == null || rows.isEmpty()) {
            Map<String, Object> ctx = new HashMap<>();
            ctx.put("movie", movie.getTitle());
            ctx.put("date", date.toString());
            ctx.put("time", timeText.isBlank() ? null : timeText);
            ctx.put("theater", theater != null ? theater.getName() : null);

            String instruction = """
                Người dùng hỏi GIỜ CHIẾU nhưng không có suất phù hợp.
                Dựa theo Context.movie, Context.date, Context.time (nếu có), Context.theater (nếu có).
                Trả lời thân thiện và gợi ý đổi ngày/đổi buổi/đổi rạp.
            """;
            return new ChatResponse(replyService.reply("hoi_gio_chieu_phim", safeJson(ctx), instruction));
        }
        // 8) map tối giản: chỉ cần theaterName + startAt
        List<ShowtimeFlatDTO> showtimes = new ArrayList<>();
        for (Map<String, Object> row : rows) {

            ShowtimeFlatDTO dto = new ShowtimeFlatDTO();

            // ===== chỉ cần cho chatbot =====
            dto.setTheaterName((String) row.get("theaterName"));

            Object startObj = row.get("startAt");
            if (startObj instanceof java.sql.Timestamp ts) {
                dto.setStartAt(ts.toLocalDateTime());
            } else if (startObj instanceof LocalDateTime ldt) {
                dto.setStartAt(ldt);
            }

            showtimes.add(dto);
        }
        // 9 GROUP THEO RẠP → GIỜ CHIẾU
        // =====================================================
        int LIMIT_PER_THEATER = 3;
        int LIMIT_THEATER = 3;
        Map<String, List<String>> byTheater = new LinkedHashMap<>();

        for (ShowtimeFlatDTO dto : showtimes) {
            String tName = dto.getTheaterName();
            String time  = dto.getStartAt().toLocalTime().toString(); // HH:mm

            if (!byTheater.containsKey(tName) && byTheater.size() >= LIMIT_THEATER) {
                continue;
            }
            List<String> times =
                    byTheater.computeIfAbsent(tName, k -> new ArrayList<>());
            if (times.size() < LIMIT_PER_THEATER) {
                times.add(time);
            }
        }
        // 10) context cho LLM
        Map<String, Object> context = new HashMap<>();
        context.put("movie", movie.getTitle());
        if (date != null) {
            context.put("date", date.toString());
        } else {
            context.put("date", "");
        }
        context.put("time", timeText.isBlank() ? null : timeText);
        context.put("theater", theater != null ? theater.getName() : null);
        context.put("showtimes_by_theater", byTheater);

        String instruction = """
            Bạn là chuyên gia gợi ý xem phim với phong cách rủ rê, thân mật, đùa cợt và ăn chơi của D-Cine.

                GIỌNG ĐIỆU:
                - Bắt buộc dùng các từ lóng: "cưng", "lên kèo", "quẩy", "siêu cuốn", "cháy", "nhức nách".
                - Sử dụng emoji nhiệt tình (🔥, 🍿, 😉).
                YÊU CẦU NỘI DUNG:
                1. Mở đầu nhiệt tình:
                - Xác nhận tên phim (Context.movie) và ngày (Context.date) bằng giọng điệu phấn khích.
                2. XỬ LÝ LỌC:
                - Nếu Context.time CÓ giá trị: Phải nói rõ đây là kết quả ĐÃ LỌC theo buổi/giờ đó.
                    Ví dụ: "Tui đã lọc suất [Tối] cho cưng rồi nè!"
                - Nếu Context.theater CÓ giá trị: Nhắc rõ tên rạp đã lọc.

                3. TRÌNH BÀY LỊCH CHIẾU (QUAN TRỌNG):
                - KHÔNG được liệt kê toàn bộ dữ liệu trong Context.showtimes_by_theater.
                - Chỉ hiển thị TỐI ĐA:
                    + 3 rạp.
                    + 3 suất chiếu cho mỗi rạp.
                - Chỉ hiển thị GIỜ chiếu (HH:mm).
                - Nếu một rạp có nhiều suất hơn giới hạn, chỉ lấy các suất GẦN NHẤT.
                - Nếu dữ liệu vượt quá giới hạn, diễn đạt ngắn gọn (ví dụ: "còn nhiều suất khác nữa").

                4. KÊU GỌI HÀNH ĐỘNG:
                - Kết thúc bằng lời rủ rê tiếp tục hành động.
                - Ví dụ:
                    + "Giờ cưng chọn rạp nào để lên kèo quẩy nè? 🔥"
                    + "Muốn tui lọc lại suất tối hay đổi sang ngày khác không? 😉"
        """;

        String reply = replyService.reply(
            "hoi_gio_chieu_phim",
            safeJson(context),
            instruction
        );

        return new ChatResponse(reply);
}
    public ChatResponse handleMessage(String message, String memoryKey) {


        ConversationContext ctx = memoryService.get(memoryKey);
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

            case "hoi_gio_chieu_phim":
                return handleMovieShowtime(e);

            case "hoi_suat_theo_rap":
                return handleTheaterShowtime(e);

            // case "hoi_suat_theo_ngay":
            //     return handleShowtimeByDate(e);

            case "hoi_co_chieu":
                return handleFullShowtime(e);

            default:
                return new ChatResponse("Mình chưa hiểu câu hỏi này. Bạn có thể nói rõ hơn không?");
        }
    }
}
