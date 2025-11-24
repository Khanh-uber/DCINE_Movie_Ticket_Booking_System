package com.example.cinema.entity;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Combo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="combo_id")
    private Long comboId;


    private String code;

    private String title ;

    private String description;

    private Double price;

    @Column(name="old_price")
    private Double old_price;
    
    private String tag;

    private String combo_url;

    private boolean active;
    public Combo() {}

    // ===== Getters & Setters =====

    public Long getComboId() {
        return comboId;
    }

    public void setComboId(Long comboId) {
        this.comboId = comboId;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Double getOld_price() {
        return old_price;
    }

    public void setOld_price(Double old_price) {
        this.old_price = old_price;
    }

    public String getTag() {
        return tag;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }

    public String getCombo_url() {
        return combo_url;
    }

    public void setCombo_url(String combo_url) {
        this.combo_url = combo_url;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
    
}
