package com.example.cinema.repository;

import com.example.cinema.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.data.jpa.repository.Query;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    

    
    Customer findCustomerByAccountId(Long accountId);
}