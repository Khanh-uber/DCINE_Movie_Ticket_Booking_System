package com.example.cinema.util;

import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.example.cinema.dto.MovieDTO;
import java.util.List;
@Component
public class ReplyHelper {
    public String toMovieList(List<MovieDTO> movies) {
        if (movies == null || movies.isEmpty()) 
            return "(không có dữ liệu)";

        return movies.stream()
            .map(m -> "- " + m.getTitle() + " (" + m.getDurationMin() + " phút)")
            .collect(Collectors.joining("\n"));
    }
}
