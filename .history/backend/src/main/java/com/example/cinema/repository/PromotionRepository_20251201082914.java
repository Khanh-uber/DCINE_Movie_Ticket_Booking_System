package com.example.cinema.repository;

import com.example.cinema.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PromotionRepository extends JpaRepository<Voucher, Long> {

        @Query(value="""
                select * from voucher
                where start_at <= CURRENT_TIMESTAMP
                and end_at >= CURRENT_TIMESTAMP
                and (usage_limit IS NULL OR used_count < usage_limit)
                """, nativeQuery = true)
        List<Voucher> findVoucherByActive();

        @Query(value = """
                select mt.tier_id as tierId,
                        mt.name    as name
                from membership_tier mt
                where mt.tier_id = :tierId
                limit 1
                """, nativeQuery = true)
        List<MembershipProjection> getMembershipTier(@Param("tierId") Long tierId);
        }
