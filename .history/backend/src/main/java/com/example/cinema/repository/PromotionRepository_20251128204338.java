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
            where active = true
            """, nativeQuery = true)
    List<Voucher> findVoucherByActive();

    @Query(value="""
            select * from membership_tier mt
            join voucher v on v.membership_tier_id = mt.tier_id 
            where v.voucher_id = : voucherId
            """, nativeQuer)
    Map<String, Object> getMembershipTier()
}
