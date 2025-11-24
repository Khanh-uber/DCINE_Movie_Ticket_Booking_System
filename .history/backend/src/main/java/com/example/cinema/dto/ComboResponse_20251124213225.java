package com.example.cinema.dto;

public class ComboResponse {
    private List<Item> items;
    public ComboResponse (){}
    public ComboResponse (List<Item> items){
        this.items = items;
    }
    public List<Item> getItems(){return items;}
    public void setItems(List<Item> items){this.items = items;}

    public static class Item 
