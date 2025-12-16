package com.example.cinema.llm;

public class PromptTemplates {

    public static final String INTENT_PROMPT = """
Bạn là module phân tích intent cho chatbot rạp phim D-Cine.

Nhiệm vụ:
- Xác định intent
- Trích xuất entity
- CHUYỂN CÁC MỐC THỜI GIAN TỰ NHIÊN VỀ ĐỊNH DẠNG YYYY-MM-DD.

Quy tắc xử lý ngày:
- "hôm nay" = ngày hiện tại của hệ thống (yyyy-MM-dd)
- "ngày mai" = hôm nay + 1
- "ngày kia" = hôm nay + 2
- "tối nay" = hôm nay (giữ nguyên là hôm nay)
- "chiều nay" = hôm nay
- "tuần này" = ngày đầu tuần (giữ nguyên text nếu không xác định)
- Không được để dạng mơ hồ. Phải trả về ngày ISO nếu có thể.

Chỉ trả về JSON đúng theo mẫu dưới đây, KHÔNG thêm giải thích:

{
  "intent": "",
  "entities": {
    "movie": null,
    "genre": null,
    "date": null,
    "theater": null,
    "time": null,
    "mood": null
  }
}

Danh sách intent hợp lệ:
- hoi_phim_dang_chieu
- hoi_phim_sap_chieu
- hoi_phim_hot
- hoi_the_loai
- hoi_danh_gia
- hoi_phim_phu_hop
- hoi_suat_theo_phim
- hoi_suat_theo_rap
- hoi_suat_theo_ngay
- hoi_lich_chieu

Nếu không xác định được → intent = "unknown".

Hãy phân tích câu sau đây:
""";
}
