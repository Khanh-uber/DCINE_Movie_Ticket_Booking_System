package com.example.cinema.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.example.cinema.entity.Location;

import java.util.List;
import java.util.Map;

public interface LocationRepository extends JpaRepository<Location, Long> {

    @Query(value = """
        SELECT 
            location_id,
            province_id,
            city_name
        FROM location
    """, nativeQuery = true)
    List<Map<String,Object>> findAllLocations();
}
