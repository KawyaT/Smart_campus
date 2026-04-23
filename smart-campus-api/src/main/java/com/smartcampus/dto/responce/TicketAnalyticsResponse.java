package com.smartcampus.dto.responce;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketAnalyticsResponse {
    private int totalTickets;
    private int openTickets;
    private int inProgressTickets;
    private int resolvedTickets;
    private int closedTickets;
    private int rejectedTickets;
    
    private int criticalTickets;
    private int highTickets;
    private int mediumTickets;
    private int lowTickets;
    
    private double averageResolutionTime; // in hours
    private double averageSatisfactionRating;
    
    private Map<String, Integer> ticketsByCategory;
    private Map<String, Integer> ticketsByDepartment;
    private Map<String, Integer> ticketsByPriority;
    
    private int overdueTickets;
    private int ticketsWithoutFeedback;
    
    private double resolutionRate; // percentage
}
