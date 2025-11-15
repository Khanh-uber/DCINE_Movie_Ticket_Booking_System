package com.example.cinema.service;

import com.example.cinema.repository.ShowTimeRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import com.example.cinema.dto.*;

@Service
public class ShowtimeService {
    private final ShowTimeRepository showtimeRepo;
    public ShowtimeService(ShowTimeRepository showtimeRepo){
        this.showtimeRepo = showtimeRepo;
    }
    public List<ShowtimeDTO> getAllShowtimesFlex(Long movieId){
        List<Map<String, Object>> rows = showtimeRepo.findShowtimes(movieId);
        
        Map<String, ShowtimeDTO> grouped = new LinkedHashMap<>();

        for(Map<String, Object> row : rows){
            Long mid = ((Number) row.get("movieId")).longValue();
            Long tid = ((Number) row.get("theaterId")).longValue();
            String date = row.get("date").toString();
            String time = row.get("time").toString();
            String lang = (String) row.get("lang");
            String label = "2D"; // gán tạm format mặc định


            String key = mid + "-" + tid + "-" + date;

            ShowtimeDTO dto = grouped.get(key);
            if (dto==null){
                dto = new ShowtimeDTO(mid, tid, date);
                grouped.put(key, dto);
            }


            // --- 3. Tìm format theo label + lang ---
            ShowtimeDTO.FormatDTO fmt = null;
            for (ShowtimeDTO.FormatDTO f : dto.getFormats()) {
                if (f.getLabel().equals(label) && f.getLang().equals(lang)) {
                    fmt = f;
                    break;
                }
            }
            
            if (fmt == null){
                fmt = new ShowtimeDTO.FormatDTO(label, lang);
                dto.getFormats().add(fmt);
            }
            // thêm giờ chiếu
            fmt.getTimes().add(time);
        }

        return new ArrayList<>(grouped.values());
        }
    
        public List<ShowtimeFlatDTO> getShowtimesFlat(Long movieId){
            List<Map<String, Object>> rows = showtimeRepo.findShowtimesFlat(movieId);

            List <ShowtimeFlatDTO> list = new ArrayList<>();
            
            for(Map<String, Object> r : rows){
                list.add(new ShowtimeFlatDTO(
                    ((Number) r.get("id")).longValue(),
                    ((Number) r.get("movieId")).longValue(),
                    ((Number) r.get("theaterId")).longValue(),
                    (r.get("date")).toString(),
                    (r.get("time")).toString(),
                    (String) r.get("date"),
                    (String) r.get("language"),
                    (String) r.get("room"),
                    new BigDecimal(r.get("price").toString()))
                    
                )
            }
        }
}
    

