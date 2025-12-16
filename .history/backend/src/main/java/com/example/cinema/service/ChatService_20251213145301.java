package com.example.cinema.service;

import org.springframework.stereotype.Service;

import com.example.cinema.dto.ChatResponse;
import com.example.cinema.dto.MovieDTO;
import com.example.cinema.dto.ShowtimeDTO;
import com.example.cinema.dto.ShowtimeFlatDTO;
import com.example.cinema.dto.TheaterDTO;
import com.example.cinema.entity.Movie;
import com.example.cinema.llm.IntentResult;
import com.example.cinema.llm.LLMReplyService;
import com.example.cinema.llm.LLMService;
import com.example.cinema.repository.ShowTimeRepository;
import com.example.cinema.util.FormatShowtimes;
import com.example.cinema.util.ReplyHelper;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDate;
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

    public ChatService(LLMService llmService, ShowtimeService showtimeService, MovieService movieService, ReplyHelper replyHelper, LLMReplyService replyService, MovieLookupService movieLookupService,
        DateParserService dateParserService, TheaterLookupService theaterLookupService, FormatShowtimes formatShowtimes, ObjectMapper objectMapper, ShowTimeRepository showTimeRepo) {
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
    private ChatResponse handleMovieShowtime(IntentResult.Entities e) {

    // 1. Lấy movie từ NER
    String movieTitle = e.getMovie();


    // 1.1 Nếu thiếu tên phim → hỏi lại
    if (movieTitle == null || movieTitle.isBlank()) {

        String instruction = """
            Người dùng muốn xem suất chiếu của một bộ phim, nhưng chưa nói tên phim.
            Hãy hỏi lại thật thân thiện và tự nhiên, có thể đùa nhẹ.
        """;

        String reply = replyService.reply(
                "hoi_suat_theo_phim",
                "{}",
                instruction
        );

        return new ChatResponse(reply);
    }

    // 2. Tìm phim trong DB (fuzzy + normalized)
    MovieDTO movie = movieLookupService.findMovie(movieTitle);

    if (movie == null) {
        System.out.println("Movie NOT FOUND in DB!");

        String instruction = """
            Không tìm thấy phim người dùng yêu cầu trong hệ thống.
            Hãy trả lời:
            - Xin lỗi vì không tìm thấy.
            - Gợi ý người dùng kiểm tra lại tên phim.
        """;

        String reply = replyService.reply(
                "hoi_suat_theo_phim",
                "{}",
                instruction
        );

        return new ChatResponse(reply);
    }

    System.out.println("Matched movie → " + movie.getTitle());

    // 3. Lấy ngày (nếu không có → default: hôm nay)
    String dateText = e.getDate();
    LocalDate date = LocalDate.now();

    if (dateText != null) {
        date = dateParserService.parse(dateText);
    }

    System.out.println("Showtime date = " + date);

    // 4. Query suất chiếu theo phim + ngày
    List<ShowtimeFlatDTO> showtimes = showtimeService.getShowtimesByMovieAndDate(movie.getId(), date);
    
    if (showtimes == null || showtimes.isEmpty()) {

        String ctx = "{ \"movie\": \"" + movie.getTitle() + "\", \"date\": \"" + dateText + "\" }";

        String instruction = """
            Không có suất chiếu nào của phim trong thời gian mà user muốn .
            Hãy trả lời thân thiện:
            - Xin lỗi vì hôm nay không có suất.
            - Gợi ý người dùng xem ngày mai hoặc chọn phim khác.
        """;

        String reply = replyService.reply(
                "hoi_suat_theo_phim",
                ctx,
                instruction
        );

        return new ChatResponse(reply);
    }

    // 5. Chuẩn bị context JSON để LLM viết câu trả lời
    String showtimeText = formatShowtimes.formatShowtimes(showtimes);

    Map<String, Object> ctx = new HashMap<>();
    ctx.put("movie", movie.getTitle());
    ctx.put("date", dateText != null ? dateText : "hôm nay");
    ctx.put("showtimes", showtimeText);

    String context;
    try {
        context = new ObjectMapper().writeValueAsString(ctx);
    } catch (Exception ex) {
        context = "{}";
    }

    // 6. Instruction cho LLM
    String instruction = """
        Hãy trả lời thân thiện cho người dùng:
        - Nói rằng phim có suất chiếu trong ngày yêu cầu.
        - Sau đó hiển thị danh sách suất chiếu đã được chuẩn bị sẵn.
        - Không sửa nội dung danh sách.
        - Có thể thêm emoji nhẹ cho vui.
    """;

    String reply = replyService.reply(
            "hoi_suat_theo_phim",
            context,
            instruction
    );

    return new ChatResponse(reply);
}
    public ChatResponse handleTheaterShowtime(IntentResult.Entities e) {
        String theaterText = e.getTheater();
        String dateText = e.getDate();
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
        String dateText    = e.getDate();

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
                    "hoi_lich_chieu",
                    "{}",
                    instruction
            );
            return new ChatResponse(reply);
        }
        MovieDTO movie = movieLookupService.findMovie(movieText);
        if (movie == null) {
            String instruction = """
                Không tìm thấy phim người dùng yêu cầu trong hệ thống.
                Hãy trả lời thân thiện:
                - Xin lỗi vì không tìm thấy phim.
                - Gợi ý người dùng kiểm tra lại tên phim.
            """;

            String reply = replyService.reply(
                    "hoi_lich_chieu",
                    "{}",
                    instruction
            );

            return new ChatResponse(reply);
        }
        LocalDate date = dateParserService.parse(dateText);
        if (date == null) {
            date = LocalDate.now();
        }

        // =====================================================
        // CHUẨN HOÁ RẠP (THIẾU / KHÔNG MATCH → ALL)
        // =====================================================
        TheaterDTO theater = theaterLookupService.findTheater(theaterText);
        Long theaterId = (theater != null) ? theater.getId() : null;

        // =====================================================
        // 5️⃣ QUERY LỊCH CHIẾU (THEO ID)
        // =====================================================
        List<Map<String, Object>> rows = showTimeRepo.findShowtimesByMovieTheaterDate(
            movie.getId(),
            theaterId,
            date
        );
        List<ShowtimeFlatDTO> showtimes = rows.stream()
        .map(ShowtimeFlatDTO::fromMap)
        .toList();

        // =====================================================
        // 6️⃣ KHÔNG CÓ LỊCH
        // =====================================================
        if (showtimes.isEmpty()) {
            String instruction = """
                Phim "%s" không có suất chiếu vào ngày %s.
                Hãy trả lời lịch sự và gợi ý xem ngày khác.
            """.formatted(movie.getTitle(), date);

            return new ChatResponse(
                replyService.reply("hoi_lich_chieu", "{}", instruction)
            );
        }

        // =====================================================
        // 7️⃣ GROUP THEO RẠP → GIỜ CHIẾU
        // =====================================================
        Map<String, List<String>> byTheater = new LinkedHashMap<>();

        for (ShowtimeFlatDTO dto : showtimes) {
            String tName = dto.getTheaterName();
            String time  = dto.getStartAt().toLocalTime().toString(); // HH:mm

            byTheater
                .computeIfAbsent(tName, k -> new ArrayList<>())
                .add(time);
        }

        // =====================================================
        // 8️⃣ BUILD CONTEXT CHO LLM
        // =====================================================
        Map<String, Object> context = new HashMap<>();
        context.put("movie", movie.getTitle());
        

        String instruction = """
            Hãy trả lời lịch chiếu phim rõ ràng, dễ đọc.
            Mỗi rạp hiển thị danh sách các suất chiếu bên dưới.
            Cuối câu gợi ý nhẹ:
            "Bạn muốn xem ở rạp nào hoặc mình lọc suất tối cho bạn nhé?"
        """;

        String reply = replyService.reply(
            "hoi_lich_chieu",
            toJson(context),
            instruction
        );

    return new ChatResponse(reply);
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

            case "hoi_suat_theo_phim":
                return handleMovieShowtime(e);

            case "hoi_suat_theo_rap":
                return handleTheaterShowtime(e);

            // case "hoi_suat_theo_ngay":
            //     return handleShowtimeByDate(e);

            // case "hoi_lich_chieu":
            //     return handleFullShowtime(e, userId);

            default:
                return new ChatResponse("Mình chưa hiểu câu hỏi này. Bạn có thể nói rõ hơn không?");
        }
    }
}
