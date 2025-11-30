package com.example.cinema.repository;

import com.example.cinema.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;

public interface PromotionRepository extends JpaRepository<Voucher, Long> {

    @Query(value="""
            select * from voucher
            """, nativeQuery = true)
    List<Voucher> findVoucherByActive();

@Query(value = """
        SELECT mt.tier_id AS tier_id,
               mt.name    AS name
        FROM membership_tier mt
        WHERE mt.tier_id = :tierId
        LIMIT 1
        """, nativeQuery = true)
List<Map<String, Object>> getMembershipTier(@Param("tierId") Long tierId);

}
