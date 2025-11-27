package com.example.cinema.dto;

import lombok.Data;
import java.util.List;

@Data
public class TicketDTO {
    private Long movieId;
    private Long theaterId;
    private Long showtimeId;

    private String movieTitle;
    private String date;
    private String time;

    private List<String> seats;        // FE dùng
    private List<SeatItemDTO> items;   // fallback

    private Integer amount;
}
