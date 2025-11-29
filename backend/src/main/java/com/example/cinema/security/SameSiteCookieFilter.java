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

        chain.doFilter(req, res);

        Collection<String> headers = res.getHeaders(HttpHeaders.SET_COOKIE);

        for (String header : headers) {
            if (header.contains("JSESSIONID")) {
                String newHeader = header + "; SameSite=None; Secure=false";
                res.setHeader(HttpHeaders.SET_COOKIE, newHeader);
            }
        }
    }
}
