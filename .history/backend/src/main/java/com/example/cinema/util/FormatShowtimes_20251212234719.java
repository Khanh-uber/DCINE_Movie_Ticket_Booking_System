package com.example.cinema.util;

import java.util.List;

import com.example.cinema.dto.ShowtimeFlatDTO;

public class FormatShowtimes {
    public String formatShowtimes(List<ShowtimeFlatDTO> showtimes) {
        
    StringBuilder sb = new StringBuilder();

    for (ShowtimeFlatDTO st : showtimes) {
        sb.append("• ")
          .append(st.getStartAt().toLocalTime()) // HH:mm
          .append(" – ")
          .append(st.getTheaterName())
          .append(" (")
          .append(st.getHallName())
          .append(")")
          .append("\n");
    }

    return sb.toString();
}
}
