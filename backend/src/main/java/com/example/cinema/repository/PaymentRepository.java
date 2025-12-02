package com.example.cinema.repository;

import com.example.cinema.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;
import java.util.Map;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByTransactionId(String transactionId);

    @Query("""
        SELECT p FROM Payment p 
        WHERE p.orderId = :orderId
    """)
    Optional<Payment> findByOrderId(@Param("orderId") Long orderId);

    @Query(value = """
        SELECT 
            s.seat_code,
            s.price
        FROM booking_seat s
        WHERE s.booking_id = :bookingId
    """, nativeQuery = true)
    List<Map<String, Object>> findSeatsByBooking(@Param("bookingId") Long bookingId);
}