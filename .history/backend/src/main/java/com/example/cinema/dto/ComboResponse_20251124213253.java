package com.example.cinema.dto;
import java.util.*;
public class ComboResponse {
    private List<Item> items;
    public ComboResponse (){}
    public ComboResponse (List<Item> items){
        this.items = items;
    }
    public List<Item> getItems(){return items;}
    public void setItems(List<Item> items){this.items = items;}

    public static class Item {
        private Long id;
        private String code;
        private String title;
        private String description;
        private Double price;
        private Double oldPrice;
        private String tag;
        private String imageUrl;
        private String category;     // FE cần category = "combo"
        private List<Variant> variants; // FE cần mảng variants rỗng
    }
