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

    @Query(value="""
            select * from membership_tier mt
            join voucher v on v.membership_tier_id = mt.tier_id 
            where mt.tier_id = :tierId
            """, nativeQuery =  true)
    Map<String, Object> getMembershipTier(@Param("tierId") Long tierId);
}
