
package com.example.cinema.repository;

import com.example.cinema.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;

public interface VoucherRepository extends JpaRepository<Voucher, Long> {

    @Query(value="""
            select * from voucher
            where code = :code
            """, nativeQuery = true)
    Voucher findVoucherByCode(@Param("code") String code);
}

