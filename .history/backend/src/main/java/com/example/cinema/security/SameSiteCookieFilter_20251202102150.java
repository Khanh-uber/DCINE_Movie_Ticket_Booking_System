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

        // Cho Spring xử lý xong (tạo session, set cookie, ...)
        chain.doFilter(req, res);

        Collection<String> headers = res.getHeaders(HttpHeaders.SET_COOKIE);
        if (headers.isEmpty()) {
            return; // Không có cookie nào thì thôi
        }

        // Xóa tất cả Set-Cookie hiện tại
        // (sẽ set lại bên dưới)
        res.setHeader(HttpHeaders.SET_COOKIE, buildModifiedCookie(headers.iterator().next()));

        boolean first = false;
        for (String header : headers) {
            if (first) {
                res.addHeader(HttpHeaders.SET_COOKIE, buildModifiedCookie(header));
            } else {
                // cái đầu tiên đã xử lý ở trên rồi
                first = true;
            }
        }
    }

    private String buildModifiedCookie(String header) {
    if (header.contains("JSESSIONID")) {
        return header
                .replaceAll(";\\s*SameSite=[^;]+", "")
                .replaceAll(";\\s*Secure", "")
                .replaceAll("\\s+$", "")  // xóa space dư
                + "; SameSite=None";      // đảm bảo cookie hợp lệ
    }
    return header;
}
    
}
