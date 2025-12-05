package com.example.cinema.controller;

import com.example.cinema.dto.ShowtimeSeatMapResponse;
import com.example.cinema.service.ShowtimeDetailService;
import com.example.cinema.service.ShowtimeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/showtimes")
public class ShowtimeController {

    private final ShowtimeService service;
    private final ShowtimeDetailService stService;

    public ShowtimeController(ShowtimeService service,ShowtimeDetailService stService) {
        this.service = service;
        this.stService = stService;
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
    public ResponseEntity<ShowtimeSeatMapResponse> getShowtimeDetail(@PathVariable Long id) {
        ShowtimeSeatMapResponse dto = stService.getSeatMapDetail(id);
        return ResponseEntity.ok(dto);
    }
}
