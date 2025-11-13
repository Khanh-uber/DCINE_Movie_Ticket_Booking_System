package com.example.cinema.entity;
import jakarta.annotation.Generated;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "theater")
public class Theater {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long theaterId;

    private String name;

    // Nhiều rạp thuộc 1 thành phố
    @ManyToOne
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    public Theater(){}

    public Long getTheaterId(){return theaterId;}
    public void setTheaterId(Long theaterId){this.theaterId = theaterId;}

    public String getName(){return name;}
    public void setName(String name){this.name = name;}

    public Location getLocation() { return location; }
    public void setLocation(Location location) { this.location = location; }

}
