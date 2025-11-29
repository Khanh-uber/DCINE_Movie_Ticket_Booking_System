package com.example.cinema.repository;

import com.example.cinema.entity.*;

import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface SeatRepository extends JpaRepository<Seat, Long>{ 
    
    // @Query(value ="""
    //         select 
    //             s.seat_id as seatId,
    //             s.row_label as rowLabel,
    //             s.seat_number as seatNumber,
    //             concat(s.row_label, s.seat_number) as code,
    //             st.name as typeName, 
    //             st.price_multiplier as multiplier
    //         from showtime sh
    //         join hall h on h.hall_id = sh.hall_id 
    //         join seat s on s.hall_id = h.hall_id
    //         join seat_type st on st.seat_type_id = s.seat_type_id
    //         where sh.showtime_id = :showtimeId
    //         ORDER BY s.row_label, s.seat_number
    //         """, nativeQuery = true)
    // List<Map<String,Object>> findSeatsByShowtime(@Param("showtimeId") Long showtimeId);


    @Query(value="""
            select * 
            from seat s
            where s.hall_id = :hallId
            """, nativeQuery = true)
    List<Seat> findSeatByHall(@Param("hallId") Long hallId);
    
    @Query(value="""
            select * 
            from seat s 
            where s.hall_id = :hallId
            and concat(s.row_label, s.seat_number) in (:seatCodes)
            """, nativeQuery = true)
    List<Seat> findSeatsByHallAndCodes(@Param("hallId") Long hallId, @Param("seatCodes") List<String> seatCodes);
    

    
    // (BookingService)
        @Query(value="""
                        select seat_id
                        from seat 
                        where hall_id = :hallId
                        and concat(row_label, seat_number) = :code
                        """, nativeQuery = true)
    Long findSeatIdByCode(@Param("hallId") Long hallId, @Param("code") String code);


    @Query(value = """
        SELECT s.*
        FROM seat s
        JOIN showtime st ON st.hall_id = s.hall_id
        WHERE st.showtime_id = :showtimeId
        AND CONCAT(s.row_label, s.seat_number) = :seatCode
        """, nativeQuery = true)
        Seat findSeatByCodeAndShowtime(
                @Param("showtimeId") Long showtimeId,
                @Param("seatCode") String seatCode);
}
