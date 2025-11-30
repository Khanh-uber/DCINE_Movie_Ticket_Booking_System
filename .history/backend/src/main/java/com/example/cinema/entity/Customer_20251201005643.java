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
    
    private String address;

    private String gender;
    @OneToOne(mappedBy = "customer")
    private Account account;

    public Customer(){}

    public Customer(Long customerId, String fn, String phone, LocalDate dob){
        this.customerId = customerId;
        this.fullName = fn;
        this.phone = phone;
        this.dob = dob;
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
    public String getAddress(){return address;}
    public void setAddress(String address){this.address = address;}

    public String getGender(){return gender;}
    public void setGender(String gender){this.gender = gender;}
}
