package com.example.cinema.dto;

import lombok.Data;
import java.util.List;

@Data
public class OrderSummaryDTO {
    private TicketDTO ticket;
    private List<ComboDTO> combos;
    private TotalsDTO totals;
    private Integer grandTotal;
}
