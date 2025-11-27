package com.example.cinema.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.example.cinema.entity.Province;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;

public interface ProvinceRepository extends JpaRepository<Province, Long> {

    @Query(value = """
        SELECT 
            p.province_id AS province_id,
            p.province_name AS province_name
        FROM province p
    """, nativeQuery = true)
    List<Map<String, Object>> getAllProvinces();

    @Query(value = """
        SELECT 
            l.location_id AS location_id,
            l.city_name AS city_name,
            l.province_id AS province_id
        FROM location l
        WHERE l.province_id = :provinceId
        ORDER BY l.city_name
    """, nativeQuery = true)
    List<Map<String, Object>> getLocationsByProvince(@Param("provinceId") Long provinceId);
}
