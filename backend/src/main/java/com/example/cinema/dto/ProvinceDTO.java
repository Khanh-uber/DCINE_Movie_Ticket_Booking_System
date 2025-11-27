package com.example.cinema.dto;

public class ProvinceDTO {
    private Long id;
    private String name;

    public ProvinceDTO(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    public ProvinceDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}