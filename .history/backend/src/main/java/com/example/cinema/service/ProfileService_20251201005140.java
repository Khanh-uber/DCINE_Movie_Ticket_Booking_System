package com.example.cinema.service;

import org.springframework.stereotype.Service;

import com.example.cinema.dto.ProfileResponse;
import com.example.cinema.dto.ProfileUpdateRequest;
import com.example.cinema.entity.Account;
import com.example.cinema.entity.Booking;
import com.example.cinema.entity.Customer;
import com.example.cinema.entity.Membership;
import com.example.cinema.repository.AccountRepository;
import com.example.cinema.repository.BookingRepository;
import com.example.cinema.repository.CustomerRepository;
import com.example.cinema.repository.MembershipRepository;
import com.example.cinema.repository.PromotionRepository;

import java.time.LocalDate;
import java.util.*;

@Service
public class ProfileService {
    
    private final AccountRepository accountRepo;
    private final BookingRepository bookingRepo;
    private final PromotionRepository promotionRepo;
    private final MembershipRepository membershipRepo;
    private final CustomerRepository customerRepo;
    public ProfileService(AccountRepository accRepo, BookingRepository bookingRepo, PromotionRepository promotionRepo, 
        MembershipRepository membershipRepo, CustomerRepository customerRepo){
        this.accountRepo = accRepo;
        this.bookingRepo = bookingRepo;
        this.promotionRepo = promotionRepo;
        this.membershipRepo = membershipRepo;
        this.customerRepo = customerRepo;
    }
    public ProfileResponse getProfile(Long accountId) {
        Map<String, Object>  acc = accountRepo.getUserInfo(accountId);
        if (acc == null){
            throw new RuntimeException("Khong tim thay tai khoan");
        }

        ProfileResponse.UserDTO u = new ProfileResponse.UserDTO();
        u.setId(((Number) acc.get("account_id")).longValue());
        u.setFullName((String) acc.get("full_name"));
        u.setUsername((String) acc.get("username"));
        u.setEmail((String) acc.get("email"));
        u.setPhone((String) acc.get("phone"));
        u.setDob(acc.get("dob").toString());
        u.setGender((String) acc.get("gender"));
        u.setAddress((String) acc.get("address"));
        u.setAvatarUrl((String) acc.get("avatar_url"));
        
        // Booking booking = bookingRepo.findPendingBookingByAccountId(accountId);
        u.setTotalSpent(bookingRepo.getTotalSpent(accountId));
        u.setMembership((String) acc.get("name"));
        u.setJoinedAt(acc.get("created_at").toString());

        ProfileResponse res = new ProfileResponse();
        res.setUser(u);

        List<ProfileResponse.MembershipTierDTO> tierList = new ArrayList<>();
        List<Membership> mList = membershipRepo.findAll();
        
        for (Membership m : mList){
            ProfileResponse.MembershipTierDTO dto = new ProfileResponse.MembershipTierDTO();
            dto.setName(m.getName());
            dto.setMin(m.getMinSpending().longValue());
            tierList.add(dto);
        }
        res.setTiers(tierList);
        return res;
    }
    public ProfileResponse upDateProfile(Long accountId, ProfileUpdateRequest req){
        Account acc = accountRepo.findByAccountId(accountId);
        if (acc == null){
            throw new RuntimeException("Không tìm thấy tài khoản");
        }
        Customer customer = customerRepo.findCustomerByAccountId(accountId);
        if (customer == null) {
            throw new RuntimeException("Không tìm thấy thông tin khách hàng");
        }
        customer.setFullName(req.getFullName());
        customer.setPhone(req.getPhone());
        if (req.getDob() != null && !req.getDob().isEmpty()) {
            customer.setDob(LocalDate.parse(req.getDob()));
        }
        customer.s
    
        
        
    }
    // public ProfileBookingResponse getUserBookings(Long accountId) {
    //     List<Booking> list = bookingRepo.findAllByAccountId(accountId);

    //     List<ProfileBookingResponse.BookingInfo> items = list.stream().map(b -> {
    //         ProfileBookingResponse.BookingInfo bi = new ProfileBookingResponse.BookingInfo();
    //         bi.setBookingCode(b.getBookingCode());

    //         // Movie
    //         ProfileBookingResponse.MovieInfo mv = new ProfileBookingResponse.MovieInfo();
    //         mv.setTitle(b.getMovie().getTitle());
    //         mv.setPosterUrl(b.getMovie().getPosterUrl());
    //         bi.setMovie(mv);

    //         // Showtime
    //         ProfileBookingResponse.ShowtimeInfo st = new ProfileBookingResponse.ShowtimeInfo();
    //         st.setTheaterName(b.getShowtime().getTheater().getName());
    //         st.setDate(b.getShowtime().getDate().toString());
    //         st.setTime(b.getShowtime().getStartTime().toString().substring(11, 16));
    //         st.setStartTime(b.getShowtime().getStartTime().toString());
    //         bi.setShowtime(st);

    //         // Seats
    //         bi.setSeats(b.getSeats()
    //             .stream()
    //             .map(s -> s.getRowLabel() + s.getSeatNumber())
    //             .toList()
    //         );

    //         // Concessions
    //         bi.setConcessions(
    //             b.getBookingConcessions().stream().map(c -> {
    //                 ProfileBookingResponse.ConcessionInfo ci =
    //                         new ProfileBookingResponse.ConcessionInfo();
    //                 ci.setName(c.getConcession().getTitle());
    //                 ci.setQuantity(c.getQuantity());
    //                 return ci;
    //             }).toList()
    //         );

    //         bi.setTotalAmount(b.getTotalAmount());

    //         return bi;
    //     }).toList();

    //     ProfileBookingResponse res = new ProfileBookingResponse();
    //     res.setBookings(items);
    //     return res;
    // }

    // public ProfileVoucherResponse getUserVouchers(Long accountId) {
    //     List<Voucher> list = voucherRepo.findByAccountId(accountId);

    //     List<ProfileVoucherResponse.VoucherInfo> vs =
    //             list.stream().map(v -> {
    //                 ProfileVoucherResponse.VoucherInfo vi =
    //                         new ProfileVoucherResponse.VoucherInfo();
    //                 vi.setCode(v.getCode());
    //                 vi.setType(v.getDiscountType());
    //                 vi.setValue(v.getDiscountValue());
    //                 vi.setDescription(v.getDescription());
    //                 vi.setMinTier(v.getMinTier());
    //                 return vi;
    //             }).toList();

    //     ProfileVoucherResponse res = new ProfileVoucherResponse();
    //     res.setVouchers(vs);
    //     return res;
    // }
}

