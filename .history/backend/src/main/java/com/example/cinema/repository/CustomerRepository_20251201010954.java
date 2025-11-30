package com.example.cinema.repository;

import com.example.cinema.entity.Customer;

import jakarta.transaction.Transactional;

import java.time.LocalDate;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    
    @Query(value="""
            select * from customer c
            join account a on a.customer_id = c.customer_id
            where a.account_id = :accountId
            """, nativeQuery=true)
    Customer findCustomerByAccountId(@Param("accountId") Long accountId);
    
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO customer " +
            "(account_id, full_name, phone, gender, dob, address, avatar_url, total_spent, membership_tier) " +
            "VALUES (:accountId, :fullName, :phone, :gender, :dob, :address, :avatarUrl, :totalSpent, :membershipTier)",
            nativeQuery = true)
    void insertCustomer(
            @Param("accountId") Long accountId,
            @Param("fullName") String fullName,
            @Param("phone") String phone,
            @Param("gender") String gender,
            @Param("dob") LocalDate dob,
            @Param("address") String address,
            @Param("avatarUrl") String avatarUrl,
            @Param("totalSpent") Long totalSpent,
            @Param("membershipTier") String membershipTier
    );
}