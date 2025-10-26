package com.example.cinema.entity;


import jakarta.persistence.*;
import java.time.LocalDate;
@Entity
@Table(name="Customer")

public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="customer_id")
    private Long customerId;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name="phone", length=20)
    private String phone;

    @Column(name="dob")
    private LocalDate dob;
    
    // Lien ket 1-1 voi account
    @OneToOne
    @JoinColumn(name = "account_id", unique = true)
    private Account account;

    public Customer(){}

    public Customer(Long customerId, String fn, String phone, LocalDate dob, Account account){
        this.customerId = customerId;
        this.fullName = fn;
        this.phone = phone;
        this.dob = dob;
        this.account = account;
    }
    // getter and setter
      // --- Getters & Setters ---
    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public LocalDate getDob() {
        return dob;
    }

    public void setDob(LocalDate dob) {
        this.dob = dob;
    }

    public Account getAccount() {
        return account;
    }

    public void setAccount(Account account) {
        this.account = account;
    }
    // --- toString ---
    @Override
    public String toString() {
        return "Customer{" +
                "customerId=" + customerId +
                ", fullName='" + fullName + '\'' +
                ", phone='" + phone + '\'' +
                ", dob=" + dob +
                ", account=" + (account != null ? account.getUsername() : "null") +
                '}';
    }
}
