package com.example.cinema.service;

import org.springframework.stereotype.Service;

import com.example.cinema.dto.ProfileResponse;
import com.example.cinema.entity.Account;
import com.example.cinema.repository.AccountRepository;
import com.example.cinema.repository.BookingRepository;
import com.example.cinema.repository.PromotionRepository;
import java.util.*;

@Service
public class ProfileService {
    
    private final AccountRepository accountRepo;
    private final BookingRepository bookingRepo;
    private final PromotionRepository promotionRepo;
    public ProfileService(AccountRepository accRepo, BookingRepository bookingRepo, PromotionRepository promotionRepo){
        this.accountRepo = accRepo;
        this.bookingRepo = bookingRepo;
        this.promotionRepo = promotionRepo;
    }
    public ProfileResponse getProfile(Long accountId) {
        Map<String, Object>  acc = accountRepo.getUserInfo(accountId)
        if (acc == null){
            throw new RuntimeException("Khong tim thay tai khoan")
        }

        ProfileResponse.UserDTO u = new ProfileResponse.UserDTO();
        u.setId(((Number) acc.get("account_id")).longValue());
        u.setFullName((String) acc.get("full_name"));
        u.setUsername(acc.getUsername());
        u.setEmail(acc.getEmail());
        u.setPhone(acc.getPhone());
        u.setDob(acc.getDob());
        u.setGender(acc.getGender());
        u.setAddress(acc.getAddress());
        u.setAvatarUrl(acc.getAvatarUrl());
        u.setTotalSpent(acc.getTotalSpent());
        u.setMembership(acc.getMembership());
        u.setJoinedAt(acc.getCreatedAt().toString());

        ProfileResponse res = new ProfileResponse();
        res.setUser(u);

        res.setTiers(List.of(
                new MembershipTierDto("Standard", 0L),
                new MembershipTierDto("Silver", 1_000_000L),
                new MembershipTierDto("Gold", 3_000_000L),
                new MembershipTierDto("Platinum", 10_000_000L)
        ));

        return res;
    }

    public ProfileBookingResponse getUserBookings(Long accountId) {
        List<Booking> list = bookingRepo.findAllByAccountId(accountId);

        List<ProfileBookingResponse.BookingInfo> items = list.stream().map(b -> {
            ProfileBookingResponse.BookingInfo bi = new ProfileBookingResponse.BookingInfo();
            bi.setBookingCode(b.getBookingCode());

            // Movie
            ProfileBookingResponse.MovieInfo mv = new ProfileBookingResponse.MovieInfo();
            mv.setTitle(b.getMovie().getTitle());
            mv.setPosterUrl(b.getMovie().getPosterUrl());
            bi.setMovie(mv);

            // Showtime
            ProfileBookingResponse.ShowtimeInfo st = new ProfileBookingResponse.ShowtimeInfo();
            st.setTheaterName(b.getShowtime().getTheater().getName());
            st.setDate(b.getShowtime().getDate().toString());
            st.setTime(b.getShowtime().getStartTime().toString().substring(11, 16));
            st.setStartTime(b.getShowtime().getStartTime().toString());
            bi.setShowtime(st);

            // Seats
            bi.setSeats(b.getSeats()
                .stream()
                .map(s -> s.getRowLabel() + s.getSeatNumber())
                .toList()
            );

            // Concessions
            bi.setConcessions(
                b.getBookingConcessions().stream().map(c -> {
                    ProfileBookingResponse.ConcessionInfo ci =
                            new ProfileBookingResponse.ConcessionInfo();
                    ci.setName(c.getConcession().getTitle());
                    ci.setQuantity(c.getQuantity());
                    return ci;
                }).toList()
            );

            bi.setTotalAmount(b.getTotalAmount());

            return bi;
        }).toList();

        ProfileBookingResponse res = new ProfileBookingResponse();
        res.setBookings(items);
        return res;
    }

    public ProfileVoucherResponse getUserVouchers(Long accountId) {
        List<Voucher> list = voucherRepo.findByAccountId(accountId);

        List<ProfileVoucherResponse.VoucherInfo> vs =
                list.stream().map(v -> {
                    ProfileVoucherResponse.VoucherInfo vi =
                            new ProfileVoucherResponse.VoucherInfo();
                    vi.setCode(v.getCode());
                    vi.setType(v.getDiscountType());
                    vi.setValue(v.getDiscountValue());
                    vi.setDescription(v.getDescription());
                    vi.setMinTier(v.getMinTier());
                    return vi;
                }).toList();

        ProfileVoucherResponse res = new ProfileVoucherResponse();
        res.setVouchers(vs);
        return res;
    }
}

