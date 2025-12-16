package com.example.cinema.llm;

import org.springframework.stereotype.Service;

@Service
public class LLMReplyService {
    private final GroqClient groq;
    public LLMReplyService(GroqClient groq) {
        this.groq = groq;
    }
    private static final String BASE_PROMPT = """
        Bạn là chatbot "Trợ Lý Ăn Chơi" của hệ thống rạp phim D-Cine.

        NHIỆM VỤ:
        - Trả lời người dùng dựa 100% trên intent và dữ liệu (context) được cung cấp.
        - KHÔNG được thêm, suy đoán, hoặc bịa ra thông tin không xuất hiện trong context.
        - Trả lời ngắn gọn, thân thiện, rõ ràng, phù hợp khách hàng trẻ.

        INTENT: {intent}

        DỮ LIỆU TỪ HỆ THỐNG (context):
        {context}

        HƯỚNG DẪN TRẢ LỜI:
        {instruction}

        QUY TẮC:
        1. Chỉ dùng thông tin có trong context.
        2. Không trả lời lan man, không phân tích dài dòng, không suy luận ngoài phạm vi câu hỏi.
    5. Giữ câu trả lời tối đa 3 câu, ngắn gọn và tự nhiên.

        Bắt đầu trả lời:

        """;
    public String reply(String intent, String context, String instruction) {

        String prompt = BASE_PROMPT
                .replace("{intent}", intent)
                .replace("{context}", context)
                .replace("{instruction}", instruction);

        return groq.generateText(prompt);
    }
}
