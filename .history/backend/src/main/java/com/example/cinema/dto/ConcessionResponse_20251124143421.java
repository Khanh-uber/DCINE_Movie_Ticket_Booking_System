package com.example.cinema.dto;
import java.util.*;
public class ConcessionResponse {
    private final TicketDTO ticket;
    private final List<ComboCartItemDTO> combos;
    private TotalsDTO totals;

    public ConcessionResponse (){}

    public TicketDTO getTicket(){return ticket;}
    public void setTicket(TicketDTO ticket){this.ticket = ticket;}

    public List<ComboCartItemDTO> getCombos(){return combos;}
    public void setCombos(List<ComboCartItemDTO> combos){this.combos = combos;}

    public TotalsDTO getTotals() {return totals;}
    public void setTotals(TotalsDTO totals){this.totals = totals;}

    public static class TicketDTO{
        private Long showtimeId;
        private List<String> items;
        private Integer amount;
        private Map<String, Object> meta;
        public TicketDTO(){}

        public Long getShowtimeId(){return showtimeId;}
        public void setShowtimeId(Long showtimeId){this.showtimeId = showtimeId;}

        public List<String> getItems(){return items;}
        public void setItems(List<String> items){this.items = items;}

        public Integer getAmount(){return amount;}
        public void setAmount(Integer amount){this.amount = amount ;}

        public Map<String, Object> getMeta(){return meta;}
        public void setMeta(Map<String, Object> meta){this.meta = meta;}

    }

    public static class ComboCartItemDTO {
        private Long comboId;
        private String title;
        private String code;
        private String variant;
        private String variantLabel;
        private Integer unitPrice;
        private Integer qty;
        private Integer lineTotal;
        
        public ComboCartItemDTO(){}
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
    

    public static class TotalsDTO{
        private Integer ticketAmount;
        private Integer combosAmount;
        private Integer grandTotal;

        public TotalsDTO() {}
        public Integer getTicketAmount(){return ticketAmount;}
        public void setTicketAmount(Integer ticketAmount){this.ticketAmount = ticketAmount;}

        public Integer getCombosAmount(){return combosAmount;}
        public void setCombosAmount(Integer combosAmount){this.combosAmount = combosAmount;}

        public Integer getGrandTotal(){return grandTotal;}
        public void setGrandTotal(Integer grandTotal){this.grandTotal = grandTotal;}
    }
}
