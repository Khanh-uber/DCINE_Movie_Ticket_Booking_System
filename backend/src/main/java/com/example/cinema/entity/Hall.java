package com.example.cinema.entity;
import jakarta.annotation.Generated;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "hall")
public class Hall {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long hallId;

    private String name;
    private Long theaterId;     
    private Integer capacity;
    public Hall(){}

    public String getName(){return name;}
    public void setName(String name){this.name = name;}
    
    public Long getTheaterId(){return theaterId;}
    public void setTheaterId(Long theaterId){this.theaterId = theaterId;}

    public Integer getCapacity(){return capacity;}
    public void setCapacity(Integer capacity){this.capacity = capacity;}
}
