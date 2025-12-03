package com.example.cinema.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;  
@Entity
@Table(name = "account")
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "account_id")
    private Long accountId;      

    @Column(name = "membership_tier_id")
    private Long memberShipId;
    

    @Column(name = "loyalty_points")
    private int loyaltyPoints ;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(name="password_hash", nullable = false)
    private String password;

    @Column(name="email", unique = true)
    private String email;

    @Column(name = "avatar_url")
    private String avatarUrl;  

    @Enumerated(EnumType.STRING)
    private Role role;
    public enum Role {
        CUSTOMER, ADMIN
    }
    
    @Column(name = "total_spending")
    private BigDecimal totalSpending;

    @Column(name="phone", unique = true)
    private String phone;

    @OneToOne
    @JoinColumn(name = "customer_id", referencedColumnName = "customer_id", unique = true)
    private Customer customer;

    @Enumerated(EnumType.STRING)
    private Status status;
    public enum Status {
        ACTIVE, INACTIVE;
    }

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Account(){}
    // public Account (String username, String password, Role role, String email){
    //     this.username = username;
    //     this.password = password;
    //     this.role = role;
    //     this.status = Status.ACTIVE;
    //     this.email = email;
    // }
    public Account(Long accountId, String username, String password, Role systemRole, Status isActive, String phone) {
        this.accountId = accountId;
        this.username = username;
        this.password = password;
        this.role = systemRole;
        this.status = isActive;
        this.phone = phone;
    }
    
    // --- Getters & Setters ---
    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }
    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role systemRole) {
        this.role = systemRole;
    }

    public boolean isActive() {
        return this.status == Status.ACTIVE;
    }

    public void setActive(Status active) {
        status = active;
    }
    public String getEmail(){
        return this.email;
    }
        
    public void setEmail(String email){
        this.email = email;
    }
    public String getPhone(){
        return this.phone;
    }
    public void setPhone(String phone){
        this.phone = phone;
    }
    public Long getMemberShipId() {
        return memberShipId;
    }
    public void setMemberShipId(Long memberShipId) {
        this.memberShipId = memberShipId;
    }
    public int getLoyaltyPoints() {
        return loyaltyPoints;
    }
    public void setLoyaltyPoints(int loyaltyPoints) {
        this.loyaltyPoints = loyaltyPoints;
    }
    public BigDecimal getTotalSpending() {
        return totalSpending;
    }
    public void setTotalSpending(BigDecimal totalSpending) {
        this.totalSpending = totalSpending;
    }
    public Customer getCustomer(){
        return customer;
    }
    public void setCustomer(Customer customer){
        this.customer = customer;
    }
    public LocalDateTime getCreatedAt(){return createdAt;}
    public void setCreatedAt(LocalDateTime createdAt){this.createdAt = createdAt;}
}
