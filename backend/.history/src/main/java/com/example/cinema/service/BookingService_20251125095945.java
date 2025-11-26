package com.example.cinema.service;

import org.springframework.stereotype.Service;

import com.example.cinema.dto.BookingRequest;
import com.example.cinema.dto.BookingResponse;
import com.example.cinema.entity.Seat;
import com.example.cinema.entity.Showtime;
import com.example.cinema.repository.BookingSeatRepository;
import com.example.cinema.repository.SeatRepository;
import com.example.cinema.repository.ShowTimeRepository;
import java.util.*;
@Service
public class BookingService {
    private final ShowTimeRepository showtimeRepo;
    private final BookingSeatRepository bookingSeatRepo;
    private final SeatRepository seatRepo;

    public BookingService(SeatRepository seatRepo, ShowTimeRepository showtimeRepo, BookingSeatRepository bookingSeatRepo){
        this.seatRepo = seatRepo;
        this.showtimeRepo = showtimeRepo;
        this.bookingSeatRepo = bookingSeatRepo;
    }
    
    public BookingResponse createBooking(Long showtimeId, List<BookingRequest.SeatRequest> requestedSeats){
        // 1 Kiem tra showtime ton tai \
        Showtime st = showtimeRepo.findByShowtimeId(showtimeId);
        if (st == null){
            throw new RuntimeException("Suất chiếu không tồn tại");
        }

        Long hallId = showtimeRepo.findHallId(showtimeId);

        List<String> codes = new ArrayList<>();
        for (BookingRequest.SeatRequest seatItem : requestedSeats){
            codes.add(seatItem.getCode());
        }
        List<Seat> validSeats = seatRepo.findSeatsByHallAndCodes(hallId, codes);
        // 2 Kiem tra ghe 
        
        if (validSeats.size() != requestedSeats.size()){
            List<String> dbSeatCodes = new ArrayList<>();
            for (Seat s : validSeats){
                dbSeatCodes.add(s.getRowLabel() + s.getSeatNumber());
            }
            List<String> invalid = new ArrayList<>(codes);
            invalid.removeAll(dbSeatCodes);

            throw new RuntimeException("Các ghế không tồn tại: " + invalid);
        }
        //3 kiem tra ghe da duoc dat chua 
        List<String> booked = seatRepo.findBookedSeats(showtimeId, codes);

        //4 Tinh gia va build danh sach item 
        List<BookingResponse.Item> items = new ArrayList<>();

        long total = 0;

        for(BookingRequest.SeatRequest reqSeat : requestedSeats){
            Seat seat =null;
            for (Seat s : validSeats)
        }

        


    }
    
}
