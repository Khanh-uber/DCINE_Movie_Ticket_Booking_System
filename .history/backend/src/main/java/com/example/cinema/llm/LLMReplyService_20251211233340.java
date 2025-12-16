package com.example.cinema.llm;

import org.springframework.stereotype.Service;

@Service
public class LLMReplyService {
    private final GroqClient groq;
    public LLMReplyService(GroqClient groq) {
        this.groq = groq;
    }
    private static final String BASE_PROMPT = """
        Bạn là chatbot có tên là "trợ lí ăn chơi" hỗ trợ khách hàng của rạp phim D-Cine.

        MỤC TIÊU:
        - Trả lời người dùng dựa trên intent và dữ liệu (context) cung cấp bên dưới.
        - Không được bịa thêm phim, suất chiếu, nội dung hoặc thông tin không có trong context.
        - Giữ giọng văn thân thiện, tự nhiên, ngắn gọn, và dễ hiểu

        INTENT CẦN XỬ LÝ:
        {intent}

        DỮ LIỆU TỪ HỆ THỐNG (context):
        {context}

        YÊU CẦU TRẢ LỜI:
        {instruction}

        LƯU Ý:
        - Nếu context rỗng, hãy giải thích lý do lịch sự.
        - Không trả lời lan man, chỉ trả đúng nội dung liên quan đến intent.
        - Không sáng tạo dữ liệu nằm ngoài context.
        """;
    public String reply(String intent, String context, String instruction) {

        String prompt = BASE_PROMPT
                .replace("{intent}", intent)
                .replace("{context}", context)
                .replace("{instruction}", instruction);

        return groq.generateText(prompt);
    }
}
