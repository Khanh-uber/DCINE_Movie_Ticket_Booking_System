package com.example.cinema.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
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
        String redisKey = key(showtime )
    }
}
