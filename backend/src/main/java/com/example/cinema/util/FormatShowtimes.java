package com.example.cinema.util;

import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Component;

import com.example.cinema.dto.ShowtimeFlatDTO;

@Component
public class FormatShowtimes {
    public String formatShowtimes(List<ShowtimeFlatDTO> showtimes) {
    showtimes.sort(
    Comparator.comparing(ShowtimeFlatDTO::getStartAt)
);
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
