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
        String email = req.getEmail();
        String phone = req.getPhone();
        String cp = req.getConfirmPassword();
        String fullName = req.getFullName();

        // 1. KIỂM TRA VÀ CHUẨN HÓA TRƯỜNG HỌ VÀ TÊN 
        if (fullName == null || fullName.trim().isEmpty()) {
            throw new RuntimeException("Họ và tên không được để trống");
        }
        
        // Tự động cắt bỏ khoảng trắng ở đầu và cuối chuỗi
        fullName = fullName.trim();
        
        // Không cho phép có 2 hoặc nhiều khoảng trắng liên tiếp nhau giữa các từ
        fullName = fullName.replaceAll("\\s+", " ");
        
        // Kiểm tra độ dài từ 2-50 ký tự
        if (fullName.length() < 2 || fullName.length() > 50) {
            throw new RuntimeException("Họ và tên phải có độ dài từ 2 đến 50 ký tự");
        }
        
        // Kiểm tra ký tự hợp lệ: Chỉ chứa chữ cái Unicode tiếng Việt có dấu và khoảng trắng.
        // Chặn hoàn toàn chữ số (0-9) và ký tự đặc biệt (@, #, $, %, *, <, >, /, \...)
        if (!fullName.matches("^[\\p{L} ]+$")) {
            throw new RuntimeException("Họ và tên chỉ được chứa chữ cái, không chứa số hay ký tự đặc biệt");
        }
        
        // Tự động viết hoa chữ cái đầu của mỗi từ 
        String[] words = fullName.split(" ");
        StringBuilder sb = new StringBuilder();
        for (String word : words) {
            if (!word.isEmpty()) {
                sb.append(Character.toUpperCase(word.charAt(0)))
                  .append(word.substring(1).toLowerCase())
                  .append(" ");
            }
        }
        fullName = sb.toString().trim();


        // 2. KIỂM TRA TÊN ĐĂNG NHẬP (USERNAME)
        if (id == null || id.trim().isEmpty())
            throw new RuntimeException("username: Tên đăng nhập không được để trống");
        
        if (id.length() < 4 || id.length() > 20)
            throw new RuntimeException("username: Tên đăng nhập phải có độ dài từ 4-20 ký tự");

        Account new_user = repo.findByUsername(id);
        if (new_user != null )
            throw new RuntimeException("username: Tài khoản đã tồn tại");


        // 3. KIỂM TRA PHÂN LOẠI VÀ ĐỊNH DẠNG EMAIL / SỐ ĐIỆN THOẠI
        String type;
        if (email != null && !email.trim().isEmpty()) {
            type = "EMAIL";
            // Kiểm tra định dạng Email hợp lệ
            if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                throw new RuntimeException("email: Định dạng Email không hợp lệ");
            }
            if (repo.findByEmail(email) != null)
                throw new RuntimeException("email: Email này đã được sử dụng");
        } else if (phone != null && !phone.trim().isEmpty()) {
            type = "PHONE";
            // Kiểm tra định dạng SĐT (Bắt đầu bằng số 0, gồm từ 10 đến 11 ký tự số)
            if (!phone.matches("^0\\d{9,10}$")) {
                throw new RuntimeException("phone: Số điện thoại không đúng định dạng hợp lệ");
            }
            if (repo.findByPhone(phone) != null)
                throw new RuntimeException("phone: Số điện thoại này đã được sử dụng");
        } else {
            throw new RuntimeException("Cần nhập email hoặc số điện thoại để đăng ký");
        }


        // 4. KIỂM TRA MẬT KHẨU (PASSWORD)
        if (psw == null || psw.trim().isEmpty())
            throw new RuntimeException("Mật khẩu không được để trống");
            
        if (psw.length() < 8) 
            throw new RuntimeException("Mật khẩu phải có ít nhất 8 ký tự trở lên");

        if (cp == null || !psw.trim().equals(cp.trim()))
            throw new RuntimeException("Mật khẩu xác nhận không khớp");

        // Biểu thức chính quy kiểm tra độ phức tạp mật khẩu (Chữ, ký tự từ 0-9, ký tự đặc biệt)
        if (!psw.matches("^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$")) {
            throw new RuntimeException("Mật khẩu phải từ 8 ký tự, gồm chữ cái, ký tự từ 0-9 và ký tự đặc biệt (@$!%*?&)");
        }


        // 5. MÃ HÓA VÀ LƯU THÔNG TIN KHÁCH HÀNG & TÀI KHOẢN
        String hashedPassword = pE.encode(req.getPassword());

        // Lưu thông tin khách hàng vào database 
        Customer c = new Customer();
        c.setFullName(fullName); 
        c.setPhone(type.equals("PHONE") ? phone : null);
        customerRepo.save(c);

        // Tạo thực thể tài khoản liên kết
        Account acc = new Account();
        acc.setUsername(id);
        acc.setEmail(type.equals("EMAIL") ? email : null);
        acc.setPhone(type.equals("PHONE") ? phone : null);
        acc.setPassword(hashedPassword);
        acc.setRole(Account.Role.CUSTOMER);
        acc.setActive(Account.Status.ACTIVE);
        acc.setTotalSpending(BigDecimal.ZERO);
        acc.setAvatarUrl("/assets/images/users/avatar_default.webp");
        acc.setCreatedAt(LocalDateTime.now());

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

        // 🔍 Xác định loại đăng nhập dựa theo định dạng cấu trúc đầu vào
        String type;
        if (id.contains("@")) {
            type = "EMAIL";
        } else if (id.matches("^0\\d{9,10}$")) {
            type = "PHONE";
        } else {
            type = "USERNAME";
        }
        
        Account acc = null;
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