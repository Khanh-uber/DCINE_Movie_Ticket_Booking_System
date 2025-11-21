package com.example.cinema.entity;
import jakarta.annotation.Generated;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.*;

@Entity
public class SeatLayout {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="set_layout_id", nullable = false)
    private Long setLayoutId ;
    
    private Long room_type_id;
    
    private String name;

    
    private int capacity;
    
    @Column(name="layout_map",nullable = false)
    private json layoutMap 
}
