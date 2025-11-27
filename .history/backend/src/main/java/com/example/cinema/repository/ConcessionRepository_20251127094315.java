package com.example.cinema.repository;

import com.example.cinema.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.data.jpa.repository.Query;

public interface ConcessionRepository extends JpaRepository<Account, Long> {
    Account findByUsername(String username);
    Account findByEmail(String email);
    Account findByPhone(String phone);
}