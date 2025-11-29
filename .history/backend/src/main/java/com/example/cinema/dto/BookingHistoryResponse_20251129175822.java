package com.example.cinema.dto;

import lombok.Data;
import java.util.*;
@Data
public class BookingHistoryResponse {
    private Long id;
    private String movie;
    private String poster;
    private String date;
    private String time;
    private List<String> seats;
    private List<String> concessions;
    private Long total;
}
