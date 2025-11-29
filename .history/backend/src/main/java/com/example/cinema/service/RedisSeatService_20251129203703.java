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

    private String key(Long showtimeId, Long accountId){
        return "hold:showtime:"+showtimeId +":"+ accountId;
    }

    public Set<String> getHeldSeatsForUser(Long showtimeId, Long accountId){
        String redisKey = key(showtimeId, accountId);
        Set<String> heldSeats = redis.opsForSet().members(redisKey);
        if (heldSeats == null) {
            return Set.of(); // Set rỗng, không có ghế pending
        }
        // Nếu Redis có dữ liệu → trả về danh sách ghế đang được giữ
        return heldSeats;
    }
    // ghe moi user dang giu
    public Set<String> getAllHeldSeats(Long showtimeId) {
        Set<String> result = new HashSet<>();

        Set<String> keys = redis.keys("pending:showtime:" + showtimeId + ":*");
        if (keys == null) return result;

        for (String k : keys) {
            Set<String> seats = redis.opsForSet().members(k);
            if (seats != null) result.addAll(seats);
        }

        return result;
    }
    public void holdSeats(Long showtimeId, List<String> seats) {
        String k = key(showtimeId);
        for (String seat : seats) {
            redis.opsForSet().add(k, seat);
        }
        // giữ 5 phút
        redis.expire(k, Duration.ofMinutes(2));
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
