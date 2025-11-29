package com.example.cinema.repository;

import com.example.cinema.entity.Theater;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;

public interface TheaterRepository extends JpaRepository<Theater, Long> {

    @Query(value = """
        SELECT 
            t.theater_id AS id,
            t.name AS name,
            t.address AS address,
            l.location_id AS location_id,
            p.province_id AS province_id,
            p.province_name AS province_name
        FROM theater t
        JOIN location l ON l.location_id = t.location_id
        JOIN province p ON p.province_id = l.province_id
        WHERE (:provinceId IS NULL OR p.province_id = :provinceId)
        ORDER BY t.theater_id
    """, nativeQuery = true)
    List<Map<String,Object>> findTheaters(@Param("provinceId") Long provinceId);

}
