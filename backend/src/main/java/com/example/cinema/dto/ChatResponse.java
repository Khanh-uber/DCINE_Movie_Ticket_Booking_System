package com.example.cinema.dto;
import java.util.List;
public class ChatResponse {
    private String reply; // câu trả lời dạng text
    private String action;
    private Long showtime_id;
    private List<Object> data;  // dữ liệu kèm theo (nếu có)

    public ChatResponse() {}
    public ChatResponse(String reply, String action, Long showtime_id, List<Object> data) {
        this.reply = reply;
        this.action = action;
        this.showtime_id = showtime_id;
        this.data = data;
    }
    public ChatResponse(String reply) {
        this.reply = reply;
    }
    public ChatResponse(List<Object>  data) {
        this.data = data;
    }
    public String getReply() { return reply; }
    public String getAction() { return action; }
    public Long getShowtime_id() { return showtime_id; }
    public List<Object> getData() { return data; }
}
