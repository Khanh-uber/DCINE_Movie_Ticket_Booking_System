package com.example.cinema.dto;

public class ConcessionResponse {
    private final TicketDTO ticket;
    private final List<ComboCartItemDTO> combos;
    private TotalsDTO totals;

    public ConcessionResponse (){}

    public TicketDTO getTicket(){return ticket;}
    public void setTicket(TicketDTO ticket){this.ticket = ticket;}

    public List<ComboCartItemDTO> 
}
