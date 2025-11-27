package com.example.cinema.dto;
import java.util.*;
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
        private Double price;
        private Double oldPrice;
        private String tag;
        private String imageUrl;
        private String category;
        private boolean active;
        private List<Variant> variants;
        
        public Item() {
        }

        public Item(Long id, String code, String title, String description, Double price,
                    Double oldPrice, String tag, String imageUrl, String category,
                    boolean active, List<Variant> variants) {
            this.id = id;
            this.code = code;
            this.title = title;
            this.description = description;
            this.price = price;
            this.oldPrice = oldPrice;
            this.tag = tag;
            this.imageUrl = imageUrl;
            this.category = category;
            this.active = active;
            this.variants = variants;
        }
        
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

        public Double getPrice() {
            return price;
        }

        public void setPrice(Double price) {
            this.price = price;
        }

        public Double getOldPrice() {
            return oldPrice;
        }

        public void setOldPrice(Double oldPrice) {
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
        private Double priceDiff;
        public Variant() {
        }

        public Variant(Long id, String label, String value, Double priceDiff) {
            this.id = id;
            this.label = label;
            this.value = value;
            this.priceDiff = priceDiff;
        }
        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getLabel() {
            return label;
        }

        public void setLabel(String label) {
            this.label = label;
        }

        public String getValue() {
            return value;
        }

        public void setValue(String value) {
            this.value = value;
        }

        public Double getPriceDiff() {
            return priceDiff;
        }

        public void setPriceDiff(Double priceDiff) {
            this.priceDiff = priceDiff;
        }
    }


}
