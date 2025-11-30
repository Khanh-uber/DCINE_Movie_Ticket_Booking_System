package com.example.cinema.repository;

import com.example.cinema.entity.Account;

import io.lettuce.core.dynamic.annotation.Param;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.*;

public interface AccountRepository extends JpaRepository<Account, Long> {
    Account findByUsername(String username);
    Account findByEmail(String email);  
    Account findByPhone(String phone);
    
    @Query(value="""
            select * from account
            where account_id = :id
            """, nativeQuery = true)
    Account findByAccountId(@Param("id") Long id);

    @Query(value="""
            select a.created_at, a.account_id, c.full_name, a.username, a.email, c.phone, c.dob, c.gender, c.address, a.avatar_url
            from account a
            join customer c on c.customer_id = a.customer_id
            where account_id = :accountId
            """, nativeQuery = true)
    Map<String, Object> getUserInfo(@Param("accountId") Long accountId);
}