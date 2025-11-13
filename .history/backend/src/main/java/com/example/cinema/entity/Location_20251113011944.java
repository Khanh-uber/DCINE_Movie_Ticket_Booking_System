package com.example.cinema.entity;
import jakarta.persistence.*;
import java.util.*;

@Entity
@Table(name = "location")
public class Location {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long locationId;

    @Column(nullable = false)
    private String city;

    // 1 thành phố có thể có nhiều rạp
    @OneToMany(mappedBy = "location")
    private List<Theater> theaters = new ArrayList<>();

    public List<Theater> getTheaters() { return theaters; }
    public void setTheaters(List<Theater> theaters) { this.theaters = theaters; }
}
