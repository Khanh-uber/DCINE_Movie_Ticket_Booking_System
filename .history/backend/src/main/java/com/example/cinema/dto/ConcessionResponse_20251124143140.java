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
    }
    

    public static class TotalsDTO{
        private Integer ticketAmount;
        private Integer combosAmount;
        private Integer grandTotal;

        public TotalsDTO() {}
        public Integer getTicketAmount(){return ticketAmount;}
        public void setTicketAmount()
    }
}
