package com.example.cinema.entity;

@Entity
@Table(name = "booking_voucher")
public class BookingVoucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long bookingId;

    private Long voucherId;

    private Long discountApplied;

    // getters & setters
}
