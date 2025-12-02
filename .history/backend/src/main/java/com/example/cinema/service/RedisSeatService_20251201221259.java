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

    private String holdKey(Long showtimeId, Long accountId){
        return "hold:showtime:"+showtimeId +":"+ accountId;
    }
    
    public Set<String> getHeldSeatsForUser(Long showtimeId, Long accountId) {
        Set<String> held = redis.opsForSet().members(holdKey(showtimeId, accountId));
        return held != null ? held : Set.of();
    }
    // ghe moi user dang giu
    public Set<String> getHeldSeatsExceptUser(Long showtimeId, Long accountId) {
        Set<String> result = new HashSet<>();

        Set<String> keys = redis.keys("hold:showtime:" + showtimeId + ":*");
        if (keys == null) return result;

        for (String k : keys) {
            if (k.equals(holdKey(showtimeId, accountId))) continue;

            Set<String> seats = redis.opsForSet().members(k);
            if (seats != null) result.addAll(seats);
        }

        return result;
    }
    public Set<String> getAllHeldSeats(Long showtimeId) {
        Set<String> result = new HashSet<>();

        Set<String> keys = redis.keys("hold:showtime:" + showtimeId + ":*");
        if (keys == null) return result;

        for (String k : keys) {
            Set<String> seats = redis.opsForSet().members(k);
            if (seats != null) result.addAll(seats);
        }

        return result;
    }
    public void holdForUser(Long showtimeId, Long accountId, List<String> seats) {
        if (seats == null || seats.isEmpty()) return;

        String redisKey = holdKey(showtimeId, accountId);

        for (String seat : seats) {
            redis.opsForSet().add(redisKey, seat);
        }
        redis.expire(redisKey, Duration.ofMinutes(5));
    }
    public void releaseForUser(Long showtimeId, Long accountId, List<String> seats) {
        if (seats == null || seats.isEmpty()) return;

        String redisKey = holdKey(showtimeId, accountId);

        for (String seat : seats) {
            redis.opsForSet().remove(redisKey, seat);
        }
    }
    // xoa du lieu khi booking hoan tat
    public void clearForUser(Long showtimeId, Long accountId) {
        redis.delete(holdKey(showtimeId, accountId));
    }
}
