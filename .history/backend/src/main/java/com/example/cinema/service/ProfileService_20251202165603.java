package com.example.cinema.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.cinema.dto.ChangePasswordRequest;
import com.example.cinema.dto.ProfileResponse;
import com.example.cinema.dto.ProfileUpdateRequest;
import com.example.cinema.entity.Account;
import com.example.cinema.entity.Booking;
import com.example.cinema.entity.Customer;
import com.example.cinema.entity.Membership;
import com.example.cinema.repository.AccountRepository;
import com.example.cinema.repository.BookingConcessionRepository;
import com.example.cinema.repository.BookingRepository;
import com.example.cinema.repository.BookingSeatRepository;
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
    private final PasswordEncoder passwordEncoder;
    private final BookingSeatRepository bookingSeatRepo;
    private final BookingConcessionRepository bookingConcessionRepo; 
    public ProfileService(AccountRepository accRepo, BookingRepository bookingRepo, PromotionRepository promotionRepo, 
        MembershipRepository membershipRepo, CustomerRepository customerRepo, PasswordEncoder passwordEncoder,
        BookingSeatRepository bookingSeatRepo,BookingConcessionRepository bookingConcessionRepo){
        this.accountRepo = accRepo;
        this.bookingRepo = bookingRepo;
        this.promotionRepo = promotionRepo;
        this.membershipRepo = membershipRepo;
        this.customerRepo = customerRepo;
        this.passwordEncoder = passwordEncoder;
        this.bookingConcessionRepo = bookingConcessionRepo;
        this.bookingSeatRepo = bookingSeatRepo;
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
    public ProfileResponse updateProfile(Long accountId, ProfileUpdateRequest req){
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
        
        customer.setAddress(req.getAddress());
        customer.setGender(req.getGender());
        acc.setPhone(req.getPhone());
        accountRepo.save(acc);
        customerRepo.save(customer);

        // build JSON trả về FE
        ProfileResponse res = new ProfileResponse();
        ProfileResponse.UserDTO u = new ProfileResponse.UserDTO();

        u.setUsername(acc.getUsername());
        u.setEmail(acc.getEmail());
        u.setPhone(customer.getPhone());
        u.setFullName(customer.getFullName());
        u.setGender(customer.getGender());
        u.setDob(customer.getDob() != null ? customer.getDob().toString() : null);
        u.setAddress(customer.getAddress());
        u.setAvatarUrl(acc.getAvatarUrl());
        // u.setMembership(acc.getMembershipTier());
        u.setTotalSpent(0L);
        u.setJoinedAt(acc.getCreatedAt().toString());
        res.setUser(u);
        return res;
    
        
        
    }
    public void changePassword(ChangePasswordRequest req, Long accountId){
        Account acc = accountRepo.findByAccountId(accountId);
        if (acc== null)
            throw new RuntimeException("Khong tim thay tai khoan");
        
        if (!passwordEncoder.matches(req.getOldPassword(), acc.getPassword()))
            throw new RuntimeException("Sai mat khau cu");
        
        // set new password 
        acc.setPassword(passwordEncoder.encode(req.getNewPassword()));
        accountRepo.save(acc);
    }
    public List<Map<String, Object>> getBookingHistory(Long accountId){
        
        List<Map<String, Object>> rows = bookingRepo.findPaidBookingSummary(accountId);

        List<Map<String, Object>> result = new ArrayList<>();
        
        for (Map<String, Object> r : rows){
            Long bookingId = ((Number) r.get("booking_id")).longValue();
            
            List<String> seatCodes = bookingSeatRepo.findSeatsCode(bookingId);

            List<Map<String, Object>> combo = bookingConcessionRepo.findConcession(bookingId);

            
            List<Map<String, Object>> concessionList = combo.stream().map(c -> Map.of(
                "title", c.get("title"),
                "quantity", c.get("quantity")
            )).toList();

            // Build Json
            Map<String, Object> obj = new HashMap<>();

            obj.put("totalAmount", r.get("total_amount"));
            obj.put("movie", Map.of(
                "title", r.get("title"),
                "posterUrl", r.get("posterUrl")
            ));
            obj.put("")
        }
        
        // List<String> seatCodes = bookingSeatRepo.findSeatsCode(accountId);
        
        // 
    }
}

