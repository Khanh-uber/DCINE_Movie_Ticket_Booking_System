package com.example.cinema.repository;

import com.example.cinema.entity.Membership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.*;
import org.springframework.transaction.annotation.*;


public interface MembershipRepository extends JpaRepository<Membership, Long>{ 
    
    List<Membership> getAllMembershipTier()''
}
