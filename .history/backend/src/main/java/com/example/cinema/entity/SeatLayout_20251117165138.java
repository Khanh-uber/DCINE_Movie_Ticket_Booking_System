package com.example.cinema.entity;
import jakarta.annotation.Generated;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.*;

@Entity
public class SeatLayout {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="seat_layout_id", nullable = false)
    private Long setLayoutId ;
    
    @Column(name="room_type_id")
    private Long roomTypeId;
    
    private String name;

    private int capacity;
    
    @Column(name = "layout_map", nullable = false, columnDefinition = "json")
    private String layoutMap;

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

public String getLayoutMap() {
    return layoutMap;
}

public void setLayoutMap(String layoutMap) {
    this.layoutMap = layoutMap;
}

}
