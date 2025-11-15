package com.example.cinema.entity;
import jakarta.persistence.*;
import java.util.*;

@Entity
@Table(name = "location")
public class Location {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long locationId;

    @Column(name = "city_name", nullable = false)
    private String city;

    // 1 thành phố có thể có nhiều rạp
    @OneToMany(mappedBy = "location")
    private List<Theater> theaters = new ArrayList<>();

    @One
    

    public Long getLocationId() { return locationId; }
    public void setLocationId(Long locationId) { this.locationId = locationId; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public List<Theater> getTheaters() { return theaters; }
    public void setTheaters(List<Theater> theaters) { this.theaters = theaters; }
}
