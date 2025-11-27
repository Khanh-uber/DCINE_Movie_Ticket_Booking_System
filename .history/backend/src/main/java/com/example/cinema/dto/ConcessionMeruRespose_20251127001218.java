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
    }
}
