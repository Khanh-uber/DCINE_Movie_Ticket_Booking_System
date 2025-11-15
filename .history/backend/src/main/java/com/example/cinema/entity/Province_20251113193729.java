package com.example.cinema.entity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="province")
public class Province {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "province_id")
    private Long id;
    
}
