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

    // @Query("""
    //     SELECT p FROM Payment p 
    //     WHERE p.orderId = :orderId
    // """)
    // Optional<Payment> findByOrderId(@Param("orderId") Long orderId);

    @Query(value = """
        SELECT 
            s.seat_code,
            s.price
        FROM booking_seat s
        WHERE s.booking_id = :bookingId
    """, nativeQuery = true)
    List<Map<String, Object>> findSeatsByBooking(@Param("bookingId") Long bookingId);

    
    @Query(value = "SELECT EXISTS(SELECT 1 FROM payment WHERE booking_id = :bookingId)", 
           nativeQuery = true)
    Long existsByBooking(@Param("bookingId") Long bookingId);


    // (ConfirmService)
    @Query(value="""
            SELECT 
                p.payment_id,
                p.transaction_id,
                p.method,
                p.amount,
                p.status AS payment_status,
                p.created_at AS payment_created_at,
                p.total_amount, 
                b.booking_id,
                b.showtime_id,
                b.account_id,
                b.status AS booking_status,
                
            FROM payment p
            JOIN booking b ON b.booking_id = p.booking_id
            WHERE b.account_id = 1
            ORDER BY p.created_at;
            """, nativeQuery = true)
    List<Payment> getLastByAccountId(@Param("accountId") Long accountId);
}