package com.example.cinema.controller;

import com.example.cinema.dto.ShowtimeDetailDTO;
import com.example.cinema.service.ShowtimeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/showtimes")
public class ShowtimeController {

    private final ShowtimeService service;

    public ShowtimeController(ShowtimeService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getShowtimes(
            @RequestParam(name = "movie", required = false) Long movieId,
            @RequestParam(name = "province", required = false) Long provinceId
    ) {

        List<Map<String, Object>> data =
                service.getShowtimesForFE(movieId, provinceId);

        return ResponseEntity.ok(data);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShowtimeSeatMapRes> getShowtimeDetail(@PathVariable Long id) {
        ShowtimeDetailDTO dto = service.getShowtimeDetail(id);
        return ResponseEntity.ok(dto);
    }
}
