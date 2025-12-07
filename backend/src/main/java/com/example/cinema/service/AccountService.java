package com.example.cinema.service;
import com.example.cinema.repository.*;

import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.math.BigDecimal; 
// import com.example.cinema.security.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.cinema.dto.ForgotPasswordRequest;
import com.example.cinema.dto.LoginRequest;
import com.example.cinema.dto.RegisterRequest;
import com.example.cinema.entity.*;
@Transactional
@Service
public class AccountService {

    private final AccountRepository repo;

    private final CustomerRepository customerRepo;

    private final PasswordEncoder pE;
    
    private final OtpRepository otpRepo;
    

    public AccountService(AccountRepository repo, CustomerRepository cus, PasswordEncoder pE, OtpRepository otpRepo){
        this.repo = repo;
        this.customerRepo = cus;
        this.pE = pE;
        this.otpRepo = otpRepo;
    }

    // dang ki 
    public Account register(RegisterRequest req) {
        String id = req.getUsername();
        String psw = req.getPassword();
        // String type = req.getRegisterType().toUpperCase();
        String email = req.getEmail();
        String phone = req.getPhone();
        String cp = req.getConfirmPassword();


        // 1. Kiểm tra rỗng
        
        if (id == null || id.trim().isEmpty())
            throw new RuntimeException("Tên đăng nhập không được để trống");
        if (psw == null || psw.trim().isEmpty())
            throw new RuntimeException("Mật khẩu không được để trống");

        // 2. Kiem tra do dai 
        if (id.length() < 4 || id.length()>20)
            throw new RuntimeException("Ten dang nhap phai co do dai tu 4-20 ki tu");
        if (psw.length() < 6) throw new RuntimeException("Mat khau phai co it nhat 6 ki tu");

        // 3. Kiem tra trung
        Account new_user = repo.findByUsername(id);
        if (new_user != null )
            throw new RuntimeException("Tai khoan da ton tai");

        // 4. Kiem tra mat khau trung khop
        if (psw == null || cp == null || !psw.trim().equals(cp.trim()))
            throw new RuntimeException("Mật khẩu xác nhận không khớp");

        // 5. Kiem tra tick dong y dieu khoan.
        // if (!check)
        //     throw new RuntimeException("Bạn phải đồng ý với Điều khoản & Chính sách trước khi đăng ký");
        
        // 6. Kiem tra loai dang ky
        String type;
        if (email != null && !email.trim().isEmpty()) {
            type = "EMAIL";
        } else if (phone != null && !phone.trim().isEmpty()) {
            type = "PHONE";
        } else {
            throw new RuntimeException("Cần nhập email hoặc số điện thoại để đăng ký");
        }

        if (type.equals("EMAIL")){
            if (repo.findByEmail(email) != null)
                throw new RuntimeException("Email da duoc su dung");
        } 
        else{
            if (repo.findByPhone(phone) != null)
                throw new RuntimeException("So dien thoai duoc su dung");
        }


        // 8. Kiem tra ki tu dac biet
        if (!psw.matches("^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$")) {
            throw new RuntimeException("Mật khẩu phải có ít nhất 8 ký tự, gồm chữ, số và ký tự đặc biệt");
}
        // Ma hoa mat khau
        String hashedPassword = pE.encode(req.getPassword());


        // Luu vao database 
        Customer c = new Customer();
        c.setFullName(req.getFullName());
        c.setPhone(req.getPhone());
        // c.setDob(req.getDob());
        c.setPhone(type.equals("PHONE") ?  phone : null);
        customerRepo.save(c);


        Account acc = new Account();
        acc.setUsername(id);
        acc.setEmail(type.equals("EMAIL") ? email : null);
        acc.setPhone(type.equals("PHONE") ? phone : null);
        acc.setPassword(hashedPassword);
        acc.setRole(Account.Role.CUSTOMER);
        acc.setActive(Account.Status.ACTIVE);
        acc.setTotalSpending(BigDecimal.ZERO); 

        acc.setCustomer(c);
        repo.save(acc);

       
        return acc;
    }

    // dang nhap
    public Account login(LoginRequest lr) {
        String id = lr.getEmailOrPhone();
        String psw = lr.getPassword();

        

        if (id == null || id.trim().isEmpty())
            throw new RuntimeException("Ten dang nhap khong duoc de trong");
        if (psw == null || psw.trim().isEmpty())
            throw new RuntimeException("Mật khẩu không được để trống");

        // 🔍 Xác định loại đăng nhập dựa theo định dạng
        String type;
        if (id.contains("@")) {
            type = "EMAIL";
        } else if (id.matches("^0\\d{9,10}$")) {
            type = "PHONE";
        } else {
            type = "USERNAME";
        }
        
        Account acc = null;
        // Account acc = repo.findByUsername(lr.getIdentifier());
        switch (type) {
            case "EMAIL":
                acc = repo.findByEmail(id);
                break;
            case "PHONE":
                acc = repo.findByPhone(id);
                break;
            case "USERNAME":
                acc = repo.findByUsername(id);
                break;
            default:
                throw new RuntimeException("Loại đăng nhập không hợp lệ");
        }

        if (acc == null)
            throw new RuntimeException("Ten dang nhap/SDT/Email khong ton tai");

        if (!pE.matches(psw, acc.getPassword())) {
            throw new RuntimeException("Mật khẩu không đúng");
        }

        if (!acc.isActive()) {
            throw new RuntimeException("Tài khoản đã bị khóa");
        }
        return acc;
    }

    // Quen mat khau
    public Account resetPassword(ForgotPasswordRequest fpr){
        String requestId = fpr.getRequestId();
        if (requestId == null || requestId.isBlank())
            throw new RuntimeException("Thiếu thông tin tài khoản (SĐT hoặc Email)");

        OtpRecord otp = otpRepo.findByRequestId(requestId);
        if (otp == null) {
            throw new RuntimeException("Mã khôi phục không hợp lệ hoặc đã hết hạn");
}

        if (!Boolean.TRUE.equals(otp.isVerified()))
            throw new RuntimeException("OTP chưa được xác thực");
        if (otp.getExpiresAt().isBefore(LocalDateTime.now()))
            throw new RuntimeException("Mã khôi phục đã hết hạn");
        
        String ident = otp.getIdentifier();
        Account acc = repo.findByEmail(ident);
        if (acc == null) acc = repo.findByPhone(ident);
        if (acc == null) throw new RuntimeException("Không tìm thấy tài khoản");
        


        String newPw = fpr.getNewPassword();
        String cfn = fpr.getConfirmPassword();


        if (newPw == null || newPw.isBlank())
            throw new RuntimeException("Mật khẩu mới không được để trống");
        if (newPw.length() < 6)
            throw new RuntimeException("Mật khẩu mới phải có ít nhất 6 ký tự");
        
        
        if (cfn == null || !cfn.equals(newPw))
            throw new RuntimeException("Mật khẩu xác thực không đúng với mật khẩu mới");
        acc.setPassword(pE.encode(newPw));
        otpRepo.deleteByRequestId(requestId);
        return repo.save(acc);
    }
    public void updateExactTotalSpending(Long accountId, Long exactTotal) {
        if (accountId == null) return;
        
        Account acc = repo.findById(accountId).orElse(null);
        if (acc != null) {
            acc.setTotalSpending(BigDecimal.valueOf(exactTotal));
            repo.save(acc);
        }
    }
    public Account findByChannelType(String input){
        Account acc = repo.findByPhone(input);
        if (acc == null)
            acc = repo.findByEmail(input);
        return acc;
    }
    public Account getAccountById(Long id) {
        return repo.findById(id).orElse(null);
    }
}
