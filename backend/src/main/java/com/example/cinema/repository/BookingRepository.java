package com.example.cinema.repository;

import com.example.cinema.entity.*;

import jakarta.transaction.Transactional;

import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface BookingRepository extends JpaRepository<Booking, Long>{ 
    
    // (BookingService)
    @Query(value = "SELECT * FROM booking " +
              "WHERE account_id = :accountId AND status = 'PENDING' " +
              "ORDER BY booking_id DESC " +
              "LIMIT 1",
      nativeQuery = true)
    Booking findLatestPending(@Param("accountId") Long accountId);

    // (ConcessionService)
        @Query("SELECT b FROM Booking b WHERE b.accountId = :accountId AND b.status = 'PENDING' ORDER BY b.bookingId DESC")
        Booking getPendingBooking(@Param("accountId") Long accountId);



    @Modifying
    @Query(value = "DELETE FROM booking WHERE booking_id = :bookingId AND status = 'PENDING'", nativeQuery = true)
    void deletePendingBookingById(@Param("bookingId") Long bookingId);


    @Query(value="""
            select * from booking
            where account_id = :accountId and status = 'PENDING'
            """, nativeQuery = true)
    List<Booking> findAllPendingByAccountId(@Param("accountId") Long accountId);


    //Profile service
    @Query(value = """
            SELECT COALESCE(SUM(total_amount), 0)
            FROM booking
            WHERE account_id = :accountId
            AND status = 'PAID'
        """, nativeQuery = true)
    Long getTotalSpent(@Param("accountId") Long accountId);

    @Query(value="""
            select b.booking_id ,
                    b.total_amount,

                    m.movie_id,
                    m.title,
                    m.poster_url as posterUrl,

                    st.showtime_id,
                    st.start_at as startTime,
                    
                    t.name as theaterName
            from booking b
            join showtime st on st.showtime_id = b.showtime_id 
            join movie m on m.movie_id = st.movie_id 
            join hall h on h.hall_id = st.hall_id
            join theater t on t.theater_id = h.theater_id 
            where b.account_id = :accountId and b.status = 'PAID'
            ORDER BY st.start_time DESC
            """, nativeQuery = true)
    List<Map<String, Object>> findPaidBookingSummary(@Param("accountId") Long accountId);

        @Query(value="""
                        select * from booking 
                        where booking_id = :bookingId
                        """, nativeQuery = true)
        Booking findByBooking(@Param("bookingId") Long bookingId);

        @Query(value = """
                SELECT 
            b.booking_id,
            b.total_amount,
            b.status,
            b.created_at,
            
            m.title AS movie_title,
            m.poster_url,
            
            
			DATE(st.start_at) AS show_date,
			TIME(st.start_at) AS show_start_time,
            th.name AS theater_name,
            
            CONCAT(s.row_label, s.seat_number) AS seat_code,
            
            c.title AS concession_name,
            bc.quantity AS concession_qty

        FROM booking b
        JOIN showtime st ON st.showtime_id = b.showtime_id
        JOIN hall h on h.hall_id = st.hall_id
        JOIN theater th ON h.theater_id = th.theater_id
        JOIN movie m ON m.movie_id = st.movie_id

        LEFT JOIN booking_seat bs ON bs.booking_id = b.booking_id
        LEFT JOIN seat s ON s.seat_id = bs.seat_id

        LEFT JOIN booking_concession bc ON bc.booking_id = b.booking_id
        LEFT JOIN concession_item c ON c.item_id = bc.item_id

        WHERE b.account_id = :accountId 
        ORDER BY b.created_at DESC

        """, nativeQuery = true)
        List<Map<String, Object>> findBookingHistoryInfo(@Param("accountId") Long accountId);
}



