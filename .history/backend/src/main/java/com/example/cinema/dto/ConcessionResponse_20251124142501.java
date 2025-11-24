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
        public void setShowtimeId()
    }
}
