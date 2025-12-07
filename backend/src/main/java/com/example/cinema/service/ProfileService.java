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
import java.math.BigDecimal;

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
    private String safeStr(Object v) {
        return v == null ? null : v.toString();
    }
    public ProfileResponse getProfile(Long accountId) {
        Account acc = accountRepo.findByAccountId(accountId);
        if (acc == null){
            throw new RuntimeException("Khong tim thay tai khoan");
        }

        Customer cus = acc.getCustomer();
        if (cus == null) {
            cus = customerRepo.findCustomerByAccountId(accountId);
        }

        ProfileResponse.UserDTO u = new ProfileResponse.UserDTO();
        u.setId(acc.getAccountId());
        u.setUsername(acc.getUsername());
        u.setEmail(acc.getEmail());
        u.setAvatarUrl(acc.getAvatarUrl());
        u.setJoinedAt(acc.getCreatedAt() != null ? acc.getCreatedAt().toString() : "");

        if (cus != null) {
            u.setFullName(cus.getFullName());
            u.setPhone(cus.getPhone());
            u.setDob(cus.getDob() != null ? cus.getDob().toString() : "");
            u.setGender(cus.getGender());
            u.setAddress(cus.getAddress());
        } else {
            u.setPhone(acc.getPhone());
        }

        BigDecimal totalSpentBD = acc.getTotalSpending();
        if (totalSpentBD == null) totalSpentBD = BigDecimal.ZERO;
        long totalSpent = totalSpentBD.longValue();
        u.setTotalSpent(totalSpent);
        List<Membership> allTiers = membershipRepo.findAll();
        Membership currentTier = null;
        Membership newTier = null;
        if (acc.getMemberShipId() != null) {
            currentTier = allTiers.stream()
                .filter(m -> m.getTierId().equals(acc.getMemberShipId()))
                .findFirst().orElse(null);
        }
        double spendingDouble = totalSpentBD.doubleValue();
        for (Membership m : allTiers) {
            Double min = m.getMinSpending();
            if (min == null) min = 0.0;
            if (spendingDouble >= min) {
                if (newTier == null || min > newTier.getMinSpending()) {
                    newTier = m;
                }
            }
        }
        if (newTier != null) {
            boolean needUpdate = false;
            if (currentTier == null) {
                needUpdate = true;
            } else if (!currentTier.getTierId().equals(newTier.getTierId())) {
                needUpdate = true;
            }

            if (needUpdate) {
                acc.setMemberShipId(newTier.getTierId());
                accountRepo.save(acc); 
            }
            u.setMembership(newTier.getName()); 
        } else {
            u.setMembership(currentTier != null ? currentTier.getName() : "Standard");
        }
        ProfileResponse res = new ProfileResponse();
        res.setUser(u);
        List<ProfileResponse.MembershipTierDTO> tierList = new ArrayList<>();
        for (Membership m : allTiers){
            ProfileResponse.MembershipTierDTO dto = new ProfileResponse.MembershipTierDTO();
            dto.setName(m.getName());
            dto.setMin(m.getMinSpending() != null ? m.getMinSpending().longValue() : 0L);
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
        String currentTier = "Standard";
        if(acc.getMemberShipId() != null) {
             Membership m = membershipRepo.findById(acc.getMemberShipId()).orElse(null);
             if(m != null) currentTier = m.getName();
        }
        u.setMembership(currentTier);
        // u.setMembership(acc.getMembershipTier());
        u.setTotalSpent(acc.getTotalSpending() != null ? acc.getTotalSpending().longValue() : 0L);
        u.setJoinedAt(acc.getCreatedAt().toString());
        res.setUser(u);
        return res;
    }
    private Long safeLong(Object o) {
        if (o == null) return 0L;
        if (o instanceof Number) return ((Number) o).longValue();
        try {
            return Long.parseLong(o.toString());
        } catch (Exception e) {
            return 0L;
        }
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
        
        List<Map<String, Object>> raw = bookingRepo.findBookingHistoryInfo(accountId);
        Map<Long, Map<String, Object>> grouped = new LinkedHashMap<>();

        for (Map<String, Object> row : raw) {
            Long bkId = ((Number) row.get("booking_id")).longValue();

            // Tạo booking nếu chưa có
            grouped.putIfAbsent(bkId, buildEmpty(row));

            Map<String, Object> bk = grouped.get(bkId);

            // ====== Seats ======
            Object seatCodeObj = row.get("seat_code");
            if (seatCodeObj != null) {
                String seatCode = seatCodeObj.toString();
                List<String> seats = (List<String>) bk.get("seats");
                if (!seats.contains(seatCode)) {
                    seats.add(seatCode);
                }
            }

            // ====== Concessions ======
            Object cnameObj = row.get("concession_name");
            Object cqtyObj = row.get("concession_qty");
            
            if (cnameObj != null) {
                String cname = cnameObj.toString();
                List<Map<String, Object>> list = (List<Map<String, Object>>) bk.get("concessions");
                boolean exists = false;
                for (Map<String, Object> item : list) {
                    if (item.get("name").equals(cname)) {
                        exists = true;
                        break;
                    }
                }
                if (!exists) {
                    list.add(Map.of(
                        "name", cname,
                        "quantity", cqtyObj == null ? 1 : ((Number)cqtyObj).intValue()
                    ));
                }
            }
        }

        return new ArrayList<>(grouped.values());
    }
    private Object safe(Object v) {
        return v == null ? "" : v;
    }

    private Map<String, Object> buildEmpty(Map<String, Object> row) {

        Map<String, Object> movie = new LinkedHashMap<>();
        movie.put("title", safe(row.get("movie_title")));
        movie.put("posterUrl", safe(row.get("poster_url")));

        Map<String, Object> showtime = new LinkedHashMap<>();
        showtime.put("theaterName", safe(row.get("theater_name")));
        showtime.put("startTime", safe(row.get("start_time")));
        showtime.put("date", safe(row.get("show_date")));          // alias: show_date
        showtime.put("time", safe(row.get("show_start_time"))); // alias: show_start_time

        Map<String, Object> obj = new LinkedHashMap<>();
        obj.put("bookingId", row.get("booking_id"));
        obj.put("totalAmount", row.get("total_amount"));
        obj.put("status", safe(row.get("status")));
        obj.put("movie", movie);
        obj.put("showtime", showtime);
        obj.put("seats", new ArrayList<String>());
        obj.put("concessions", new ArrayList<Map<String, Object>>());

        return obj;
    }
}

