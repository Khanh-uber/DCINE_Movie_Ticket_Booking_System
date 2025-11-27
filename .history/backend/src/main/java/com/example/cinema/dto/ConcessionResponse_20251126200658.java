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

    public static class TicketInfo{
        private Long showtimeId;
        private String movieTitle;
        private String date;
        private String time;
        private List<SeatItems> items
        private Long totalAmount;

        public TicketInfo(){}
        public Long getShowtimeId(){return showtimeId;}
        public void setShowtimeId(Long showtimeId){this.showtimeId = showtimeId;}

        public String getMovieTitle(){return movieTitle;}
        public void setMovieTitle(String movieTitle){this.movieTitle = movieTitle;}

        public String getDate(){return date;}
        public void setDate(String date){this.date = date;}
        
        public String getTime(){return time;}
        public void setTime(String time){this.time = time;}

        public List<SeatItems> getSeatItems(){return items;}
        public void setSeatItems(List<SeatItems> items){this.items = items;}

        public Long totalAmount(){return totalAmount;}
        public void setTotalAMount(Long totalAmount){this.totalAmount = totalAmount;}
        
    }
    public static class SeatItems {
        private String code;
        private String zone;
        private String type;
        private String 
    }

    public static class ComboItem {
        private Long comboId;
        private String title;
        private String code;
        private String variant;
        private String variantLabel;
        private Integer unitPrice;
        private Integer qty;
        private Integer lineTotal;

        public ComboItem(){}

        //getter setter
        public Long getComboId() {
            return comboId;
        }

        public void setComboId(Long comboId) {
            this.comboId = comboId;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getCode() {
            return code;
        }

        public void setCode(String code) {
            this.code = code;
        }

        public String getVariant() {
            return variant;
        }

        public void setVariant(String variant) {
            this.variant = variant;
        }

        public String getVariantLabel() {
            return variantLabel;
        }

        public void setVariantLabel(String variantLabel) {
            this.variantLabel = variantLabel;
        }

        public Integer getUnitPrice() {
            return unitPrice;
        }

        public void setUnitPrice(Integer unitPrice) {
            this.unitPrice = unitPrice;
        }

        public Integer getQty() {
            return qty;
        }

        public void setQty(Integer qty) {
            this.qty = qty;
        }

        public Integer getLineTotal() {
            return lineTotal;
        }

        public void setLineTotal(Integer lineTotal) {
            this.lineTotal = lineTotal;
        }
    }
    

    public static class Totals{
        private Integer ticketAmount;
        private Integer combosAmount;
        private Integer grandTotal;

        public Totals() {}
        public Integer getTicketAmount(){return ticketAmount;}
        public void setTicketAmount(Integer ticketAmount){this.ticketAmount = ticketAmount;}

        public Integer getCombosAmount(){return combosAmount;}
        public void setCombosAmount(Integer combosAmount){this.combosAmount = combosAmount;}

        public Integer getGrandTotal(){return grandTotal;}
        public void setGrandTotal(Integer grandTotal){this.grandTotal = grandTotal;}
    }
}
