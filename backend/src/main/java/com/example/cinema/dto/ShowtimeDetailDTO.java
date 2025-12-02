package com.example.cinema.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class ShowtimeDetailDTO {

    private Long showtimeId;
    private Long movieId;
    private String movieTitle;
    private String posterUrl;
    private String trailerUrl;
    private String theaterName;
    private String showDate;
    private String startTime;
    private String endTime;
    private String formatName;
    private String releaseYear;
    private Integer durationMin;
    private List<String> genres;

    public static ShowtimeDetailDTO fromRaw(Map<String,Object> m) {
        ShowtimeDetailDTO dto = new ShowtimeDetailDTO();

        dto.setShowtimeId(((Number)m.get("showtimeId")).longValue());
        dto.setMovieId(((Number)m.get("movieId")).longValue());
        dto.setMovieTitle((String)m.get("movieTitle"));
        dto.setPosterUrl((String)m.get("poster_url"));
        dto.setTrailerUrl((String)m.get("trailer_url"));
        dto.setTheaterName((String)m.get("theaterName"));
        dto.setShowDate(String.valueOf(m.get("showDate")));
        dto.setStartTime(String.valueOf(m.get("startTime")));
        dto.setEndTime(String.valueOf(m.get("endTime")));
        dto.setFormatName((String)m.get("formatName"));
        dto.setReleaseYear(String.valueOf(m.get("releaseYear")));
        dto.setDurationMin(m.get("durationMin") != null ? ((Number)m.get("durationMin")).intValue() : null);

        Object genresRaw = m.get("genres");
        dto.setGenres(genresRaw instanceof List ? (List<String>) genresRaw : List.of());

        return dto;
    }
}
