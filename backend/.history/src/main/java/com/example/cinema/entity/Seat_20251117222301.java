package com.example.cinema.entity;


import jakarta.annotation.Generated;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.*;

@Entity
public class Seat {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="seat_id", nullable = false)
    private Long seatId;

    @Column(name="hall_id", nullable = false)
    private Long hallId;

    @Column(name="row_label", nullable = false)
    private String rowLabel;

    @Column(name="seat_number", nullable = false)
    private int seatNumber;

    @Column(name="seat_type_id", nullable = false)
    private Long seatTypeId;

    public Seat(){}

public Long getSeatId() {
    return seatId;
}

public void setSeatId(Long seatId) {
    this.seatId = seatId;
}

public Long getHallId() {
    return hallId;
}

public void setHallId(Long hallId) {
    this.hallId = hallId;
}

public String getRowLabel() {
    return rowLabel;
}

public void setRowLabel(String rowLabel) {
    this.rowLabel = rowLabel;
}

public int getSeatNumber() {
    return seatNumber;
}

public void setSeatNumber(int seatNumber) {
    this.seatNumber = seatNumber;
}

public Long getSeatTypeId() {
    return seatTypeId;
}

public void setSeatTypeId(Long seatTypeId) {
    this.seatTypeId = seatTypeId;
}


}
