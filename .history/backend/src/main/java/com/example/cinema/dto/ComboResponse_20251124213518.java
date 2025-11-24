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
        private String category = "combo";     // FE cần category = "combo"
        private List<Variant> variants; // FE cần mảng variants rỗng
         public Item() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Double getPrice() { return price; }
        public void setPrice(Double price) { this.price = price; }

        public Double getOldPrice() { return oldPrice; }
        public void setOldPrice(Double oldPrice) { this.oldPrice = oldPrice; }

        public String getTag() { return tag; }
        public void setTag(String tag) { this.tag = tag; }

        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public List<Variant> getVariants() { return variants; }
        public void setVariants(List<Variant> variants) { this.variants = variants; }
    }
    }
