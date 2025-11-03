package com.example.cinema.service;
import com.example.cinema.repository.*;


// import com.example.cinema.security.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.cinema.dto.ForgotPasswordRequest;
import com.example.cinema.dto.LoginRequest;
import com.example.cinema.dto.RegisterRequest;
import com.example.cinema.entity.*;
@Service
public class AccountService {

    private final AccountRepository repo;

    private final CustomerRepository customerRepo;

    private final PasswordEncoder pE;

    public AccountService(AccountRepository repo, CustomerRepository cus, PasswordEncoder pE){
        this.repo = repo;
        this.customerRepo = cus;
        this.pE = pE;
    }

    // dang ki 
    public Account register(RegisterRequest req) {
        String id = req.getUsername();
        String psw = req.getPassword();
        boolean check = req.isAgreeTerm();
        String type = req.getRegisterType().toUpperCase();
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
        if (!check)
            throw new RuntimeException("Bạn phải đồng ý với Điều khoản & Chính sách trước khi đăng ký");
        
        // 6. Kiem tra loai dang ky

        if (type.equals("EMAIL")){
            if (repo.findByEmail(email) != null)
                throw new RuntimeException("Email da duoc su dung");
        } 
        else if (type.equals("PHONE")){
            if (repo.findByPhone(phone) != null)
                throw new RuntimeException("So dien thoai duoc su dung");
        }else {
            throw new RuntimeException("Loại đăng ký không hợp lệ");
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

        acc.setCustomer(c);
        repo.save(acc);

       
        return acc;
    }

    // dang nhap
    public Account login(LoginRequest lr) {
        String id = lr.getIdentifier();
        String psw = lr.getPassword();
        String type = lr.getLoginType();
        if (id == null || id.trim().isEmpty())
            throw new RuntimeException("Ten dang nhap khong duoc de trong");
        if (psw == null || psw.trim().isEmpty())
            throw new RuntimeException("Mật khẩu không được để trống");

        
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
        String input = fpr.getIdentifier();
        Account acc = repo.findByPhone(input);
        if (acc == null){
            acc = repo.findByEmail(input);
        }
        if (acc == null)
            throw new RuntimeException("Khong tim thay tai khoan");

        String newPw = fpr.getNewPassword();
        if (newPw == null || newPw.isBlank())
            throw new RuntimeException("Mật khẩu mới không được để trống");
        if (newPw.length() < 6)
            throw new RuntimeException("Mật khẩu mới phải có ít nhất 6 ký tự");
        
        String cfn = fpr.getConfirmPassword();
        if (cfn == null || !cfn.equals(newPw))
            throw new RuntimeException("Mật khẩu xác thực không đúng với mật khẩu mới");
        acc.setPassword(pE.encode(newPw));
        return repo.save(acc);
    }
    public Account findByChannelType(String input){
        Account acc = repo.findByUsername(input);
        if (acc == null)
            acc = repo.findByEmail(input);
        return acc;
    }
}
