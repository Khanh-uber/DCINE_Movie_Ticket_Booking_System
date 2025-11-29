package com.example.cinema.repository;

import com.example.cinema.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.*;
// import org.springframework.transaction.annotation.*;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.Modifying;
public interface MemberShipRepository extends JpaRepository<<Membership, Long>{ 
    
}
