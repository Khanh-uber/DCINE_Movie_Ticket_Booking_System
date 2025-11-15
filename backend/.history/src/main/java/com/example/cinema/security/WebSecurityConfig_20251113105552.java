package com.example.cinema.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // tắt CSRF khi test API
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/auth/**",  // cho phép toàn bộ API của bạn
                    "/hometest",     // hoặc endpoint test
                    "/home",
                    "/api/staff/**",
                    "/api/manager/**",
                    "/api/profile",
                    "/api/movies/**",
                    "/uploads/**",// ✅ Cho phép toàn bộ ảnh, video, poster
                    "api/showtimes/**",
                    "/api/theaters/**"
                ).permitAll()
        
                .anyRequest().authenticated()
            );
        return http.build();
    }
    // 4️⃣ Bean PasswordEncoder để mã hóa mật khẩu (BCrypt)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://127.0.0.1:5500", "http://localhost:5500","http://127.0.0.1:5500") // FE của bạn
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
            

            // Thêm đoạn này để cho phép truy cập ảnh /uploads/**
            @Override
            public void addResourceHandlers(org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry registry) {
                registry.addResourceHandler("/uploads/**")
                        .addResourceLocations("file:uploads/");
                // Nếu thư mục uploads nằm ở nơi khác:
                // .addResourceLocations("file:C:/Users/YourName/Desktop/cinema/uploads/");
            }
        };
    }
     // 2️⃣ Cho phép Postman / public API (không credentials)
    // @Bean
    // public WebMvcConfigurer publicCorsConfigurer() {
    //     return new WebMvcConfigurer() {
    //         @Override
    //         public void addCorsMappings(CorsRegistry registry) {
    //             registry.addMapping("/public/**")
    //                     .allowedOrigins("*")
    //                     .allowedMethods("*")
    //                     .allowedHeaders("*")
    //                     .allowCredentials(false);
    //         }
    //     };
    // }
}
