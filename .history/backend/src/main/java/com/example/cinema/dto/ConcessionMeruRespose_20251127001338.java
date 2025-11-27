package com.example.cinema.dto;
import java.util.*;

import com.example.cinema.dto.ConcessionListResponse.Variant;
public class ConcessionMeruRespose {
    private List<Item> items;
    public ConcessionMeruRespose(){}
    public List<Item> getItems(){return items;}
    public void setItems(List<Item> items){this.items= items;}

    public static class Item {
        private Long id;
        private String code;
        private String title;
        private String description;
        private Long price;
        private Long oldPrice;
        private String tag;
        private String imageUrl;
        private String category;
        private boolean active;
        private List<Variant> variants;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
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

        public Long getPrice() {
            return price;
        }

        public void setPrice(Long price) {
            this.price = price;
        }

        public Long getOldPrice() {
            return oldPrice;
        }

        public void setOldPrice(Long oldPrice) {
            this.oldPrice = oldPrice;
        }

        public String getTag() {
            return tag;
        }

        public void setTag(String tag) {
            this.tag = tag;
        }

        public String getImageUrl() {
            return imageUrl;
        }

        public void setImageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public boolean isActive() {
            return active;
        }

        public void setActive(boolean active) {
            this.active = active;
        }

        public List<Variant> getVariants() {
            return variants;
        }

        public void setVariants(List<Variant> variants) {
            this.variants = variants;
        }
    }
    public static class Variant {
        private Long id;
        private String label;
        private String value;
        private Long priceDiff;
    }


}
