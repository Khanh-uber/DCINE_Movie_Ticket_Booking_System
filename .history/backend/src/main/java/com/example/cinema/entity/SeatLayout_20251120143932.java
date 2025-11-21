package com.example.cinema.entity;
import jakarta.annotation.Generated;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.*;
import com.vladmihalcea.hibernate.type.json.JsonType;
import org.hibernate.annotations.Type;


@Entity
public class SeatLayout {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="seat_layout_id", nullable = false)
    private Long seatLayoutId ;
    
    @Column(name="room_type_id")
    private Long roomTypeId;
    
    private String name;

    private int capacity;
    
    @Type(JsonType.class)
    @Column(name = "layout_map", columnDefinition = "json")
    private Map<String, Object> layoutMap;

    public SeatLayout(){}
    public Long getSeatLayoutId() {
        return seatLayoutId;
    }

    public void setSeatLayoutId(Long seatLayoutId) {
        this.seatLayoutId = seatLayoutId;
    }

    public Long getRoomTypeId() {
        return roomTypeId;
    }

    public void setRoomTypeId(Long roomTypeId) {
        this.roomTypeId = roomTypeId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public Map<String, Object> getLayoutMap() {
        return layoutMap;
    }

    public void setLayoutMap(Map<String, Object>  layoutMap) {
        this.layoutMap = layoutMap;
    }

}
