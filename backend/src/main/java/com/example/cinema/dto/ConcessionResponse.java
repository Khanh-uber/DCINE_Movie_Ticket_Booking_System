package com.example.cinema.dto;

import java.util.*;

public class ConcessionResponse {

    private TicketInfo ticket;
    private List<ComboItem> combos;
    private Totals totals;

    public ConcessionResponse(){}

    public TicketInfo getTicket(){return ticket;}
    public void setTicket(TicketInfo ticket){this.ticket = ticket;}

    public List<ComboItem> getCombos(){return combos;}
    public void setCombos(List<ComboItem> combos){this.combos = combos;}

    public Totals getTotals() {return totals;}
    public void setTotals(Totals totals){this.totals = totals;}

    // ================= TICKET INFO =================
    public static class TicketInfo{
        private Long showtimeId;
        private String movieTitle;
        private String date;
        private String time;
        private String endTime;
        private String theaterName; 
        private List<SeatItems> items;
        private Long totalAmount;
        // private Map<String, Object> meta;

        public TicketInfo(){}
        
        public Long getShowtimeId(){return showtimeId;}
        public void setShowtimeId(Long showtimeId){this.showtimeId = showtimeId;}

        public String getMovieTitle(){return movieTitle;}
        public void setMovieTitle(String movieTitle){this.movieTitle = movieTitle;}

        public String getDate(){return date;}
        public void setDate(String date){this.date = date;}
        
        public String getTime(){return time;}
        public void setTime(String time){this.time = time;}

        public String getEndTime() { return endTime; }
        public void setEndTime(String endTime) { this.endTime = endTime; }

        public String getTheaterName(){return theaterName;}
        public void setTheaterName(String theaterName){this.theaterName = theaterName;}

        public List<SeatItems> getSeatItems(){return items;}
        public void setSeatItems(List<SeatItems> items){this.items = items;}

        public Long getTotalAmount(){return totalAmount;}
        public void setTotalAmount(Long totalAmount){this.totalAmount = totalAmount;}
    }

    public static class SeatItems {
        private String code;
        private String zone;
        private String type;
        private Long price;
        
        public SeatItems(){}
        
        public String getZone(){return zone;} 
        public void setZone(String zone){this.zone = zone;}

        public String getCode(){return code;}
        public void setCode(String code){this.code = code;}

        public String getType(){return type;}
        public void setType(String type){this.type = type;}

        public Long getPrice(){ return price; }
        public void setPrice(Long price){this.price = price;}
    }

    public static class ComboItem {
        private Long comboId;
        private String title;
        private String code;
        private String variant;
        private String variantLabel;
        private Double unitPrice;
        private Integer qty;
        private Double lineTotal;  
        private String imageUrl;

        public ComboItem(){}

        public Long getComboId() { return comboId; }
        public void setComboId(Long comboId) { this.comboId = comboId; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }

        public String getVariant() { return variant; }
        public void setVariant(String variant) { this.variant = variant; }

        public String getVariantLabel() { return variantLabel; }
        public void setVariantLabel(String variantLabel) { this.variantLabel = variantLabel; }

        public Double getUnitPrice() { return unitPrice; }
        public void setUnitPrice(Double unitPrice) { this.unitPrice = unitPrice; }

        public Integer getQty() { return qty; }
        public void setQty(Integer qty) { this.qty = qty; }

        public Double getLineTotal() { return lineTotal; }
        public void setLineTotal(Double lineTotal) { this.lineTotal = lineTotal; }
        
        public String getImageUrl(){return imageUrl;}
        public void setImageUrl(String imageUrl){this.imageUrl = imageUrl;}
    }
    
    public static class Totals{
        private Long ticketAmount;
        private Long combosAmount;
        private Long grandTotal;

        public Totals() {}
        public Long getTicketAmount(){return ticketAmount;}
        public void setTicketAmount(Long  ticketAmount){this.ticketAmount = ticketAmount;}

        public Long getCombosAmount(){return combosAmount;}
        public void setCombosAmount(Long combosAmount){this.combosAmount = combosAmount;}

        public Long getGrandTotal(){return grandTotal;}
        public void setGrandTotal(Long grandTotal){this.grandTotal = grandTotal;}
    }
}