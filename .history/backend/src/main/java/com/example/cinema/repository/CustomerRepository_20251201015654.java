package com.example.cinema.repository;

import com.example.cinema.entity.Customer;

import jakarta.transaction.Transactional;

import java.time.LocalDate;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    
    @Query(value = """
    SELECT c.* 
    FROM customer c
    JOIN account a ON a.customer_id = c.customer_id
    WHERE a.account_id = :accountId
    """, nativeQuery = true)
Customer findCustomerByAccountId(@Param("accountId") Long accountId);
    
    
}