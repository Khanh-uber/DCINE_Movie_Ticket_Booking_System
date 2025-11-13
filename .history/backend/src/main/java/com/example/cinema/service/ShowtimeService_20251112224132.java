package com.example.cinema.service;

import com.example.cinema.repository.ShowTimeRepository;

import java.util.*;
import com.example.cinema.dto.*;
public class ShowtimeService {
    private final ShowTimeRepository showtimeRepo;
    public ShowtimeService(ShowTimeRepository showtimeRepo){
        this.showtimeRepo = showtimeRepo;
    }
    public ShowtimeDTO getAllShowtimes(){
        List<Map<String, Object>> rows = showtimeRepo.findAllShowtimes();
        
        Map<String, ShowtimeDTO> grouped = new LinkedHashMap<>();

        for(Map<String, Object> row : rows){
            Long mid = ((Number) row.get("movie_id")).longValue();
            Long tid = ((Number) row.get("theater_id")).longValue();
            String date = row.get("date").toString();
            String time = row.get("time").toString();
            String lang = (String) row.get("lang");
            String label = "2D"; // gán tạm format mặc định

            // === Key unique theo movie + theater + date ===
            String key = mid + "-" + tid + "-" + date;
            ShowtimeResponse dto = grouped.computeIfAbsent(key,
                k -> new ShowtimeResponse(mid, tid, date));

            // === tìm hoặc tạo format group ===
            ShowtimeResponse.FormatDTO fmt = dto.getFormats().stream()
                .filter(f -> f.getLabel().equals(label) && f.getLang().equals(lang))
                .findFirst()
                .orElseGet(() -> {
                    ShowtimeResponse.FormatDTO f = new ShowtimeResponse.FormatDTO(label, lang);
                    dto.getFormats().add(f);
                    return f;
                });

            // thêm giờ chiếu
            fmt.getTimes().add(time);
        }

        return new ArrayList<>(grouped.values());
        }
        
        
    }
    
}
