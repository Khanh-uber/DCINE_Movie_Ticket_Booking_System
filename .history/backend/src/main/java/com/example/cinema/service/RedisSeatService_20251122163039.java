package com.example.cinema.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.*;
@Service
public class RedisSeatService {
    private final StringRedisTemplate redis;
    public RedisSeatService(StringRedisTemplate redis){
        this.redis = redis;
    }

    private String key(Long showtimeId){
        return "hold:showtime:"+showtimeId;
    }

    public Set<String> getHeldSeats(Long showtimeId){
        String redisKey = key(showtimeId);
        Set<String> heldSeats = redis.opsForSet().members(redisKey);
        if (heldSeats == null) {
            return Set.of(); // Set rỗng, không có ghế pending
        }
        // Nếu Redis có dữ liệu → trả về danh sách ghế đang được giữ
        return heldSeats;
    }

    public void holdSeats(Long showtimeId, List<String> seats) {
        String k = key(showtimeId);
        for (String seat : seats) {
            redis.opsForSet().add(k, seat);
        }
        // giữ 5 phút
        redis.expire(k, Duration.ofMinutes(5));
    }
    public void releaseSeats(Long showtimeId, List<String> seats) {
        String k = key(showtimeId);
        for (String seat : seats) {
            redis.opsForSet().remove(k, seat);
        }
    }
    public void clearAllHeld(Long showtimeId) {
        redis.delete(key(showtimeId));
    }
}
