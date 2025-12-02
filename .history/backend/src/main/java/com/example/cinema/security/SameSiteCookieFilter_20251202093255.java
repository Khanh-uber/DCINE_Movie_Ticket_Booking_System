package com.example.cinema.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collection;

@Component
public class SameSiteCookieFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest req,
                                    HttpServletResponse res,
                                    FilterChain chain)
            throws ServletException, IOException {

        // 1. Cho phép request chạy qua để session được tạo
        chain.doFilter(req, res);

        // 2. Lấy tất cả các header Set-Cookie từ response
        Collection<String> headers = res.getHeaders(HttpHeaders.SET_COOKIE);
        
        // Cần xóa header cũ để thêm header mới đã sửa đổi
        res.setHeader(HttpHeaders.SET_COOKIE, null); 

        for (String header : headers) {
            if (header.contains("JSESSIONID")) {
                
                // 3. Loại bỏ thuộc tính SameSite và Secure (nếu có)
                String modifiedHeader = header
                    // Loại bỏ bất kỳ SameSite nào (ví dụ: ; SameSite=Lax)
                    .replaceAll(";\\s*SameSite=[^;]+", "") 
                    // Loại bỏ cờ Secure (ví dụ: ; Secure)
                    .replaceAll(";\\s*Secure", ""); 
                
                // 4. Thêm header đã sửa đổi
                res.addHeader(HttpHeaders.SET_COOKIE, modifiedHeader);
                
            } else {
                // 5. Giữ lại các cookie khác (nếu có)
                res.addHeader(HttpHeaders.SET_COOKIE, header);
            }
        }
    }
}