package com.smartcampus.controller.ticket;

import com.smartcampus.dto.request.CreateTicketRequest;
import com.smartcampus.dto.request.UpdateTicketRequest;
import com.smartcampus.dto.responce.TicketDetailResponse;
import com.smartcampus.dto.responce.TicketResponse;
import com.smartcampus.model.ticket.Ticket;
import com.smartcampus.service.ticket.TicketService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "*")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    /**
     * Create a new ticket
     */
    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(@Valid @RequestBody CreateTicketRequest request) {
        // In a real scenario, get userId from authentication context
        String userId = "user-123"; // TODO: Replace with actual user from auth
        String userName = "Current User";
        TicketResponse response = ticketService.createTicket(request, userId, userName);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get all tickets
     */
    @GetMapping
    public ResponseEntity<List<TicketResponse>> getAllTickets() {
        List<TicketResponse> tickets = ticketService.getAllTickets();
        return ResponseEntity.ok(tickets);
    }

    /**
     * Get ticket by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<TicketDetailResponse> getTicketById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(ticketService.getTicketById(id));
        } catch (RuntimeException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update ticket
     */
    @PutMapping("/{id}")
    public ResponseEntity<TicketResponse> updateTicket(@PathVariable String id,
                                                       @RequestBody UpdateTicketRequest request) {
        try {
            return ResponseEntity.ok(ticketService.updateTicket(id, request));
        } catch (RuntimeException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete ticket
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteTicket(@PathVariable String id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.ok(Map.of("message", "Ticket deleted successfully"));
    }

    /**
     * Get tickets by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<TicketResponse>> getTicketsByStatus(@PathVariable String status) {
        try {
            Ticket.TicketStatus statusEnum = Ticket.TicketStatus.valueOf(status.toUpperCase());
            return ResponseEntity.ok(ticketService.getTicketsByStatus(statusEnum));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(List.of());
        }
    }

    /**
     * Get tickets by priority
     */
    @GetMapping("/priority/{priority}")
    public ResponseEntity<List<TicketResponse>> getTicketsByPriority(@PathVariable String priority) {
        try {
            Ticket.TicketPriority priorityEnum = Ticket.TicketPriority.valueOf(priority.toUpperCase());
            return ResponseEntity.ok(ticketService.getTicketsByPriority(priorityEnum));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(List.of());
        }
    }

    /**
     * Get tickets assigned to user
     */
    @GetMapping("/assigned/{userId}")
    public ResponseEntity<List<TicketResponse>> getTicketsAssignedTo(@PathVariable String userId) {
        List<TicketResponse> tickets = ticketService.getTicketsByAssignee(userId);
        return ResponseEntity.ok(tickets);
    }

    /**
     * Get tickets created by user
     */
    @GetMapping("/created-by/{userId}")
    public ResponseEntity<List<TicketResponse>> getTicketsCreatedBy(@PathVariable String userId) {
        List<TicketResponse> tickets = ticketService.getAllTickets().stream()
                .filter(ticket -> userId.equals(ticket.getReporterId()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(tickets);
    }

    /**
     * Get tickets by category
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<TicketResponse>> getTicketsByCategory(@PathVariable String category) {
        List<TicketResponse> tickets = ticketService.getTicketsByCategory(category);
        return ResponseEntity.ok(tickets);
    }

    /**
     * Search tickets by keyword
     */
    @GetMapping("/search")
    public ResponseEntity<List<TicketResponse>> searchTickets(@RequestParam String keyword) {
        List<TicketResponse> tickets = ticketService.searchTickets(keyword);
        return ResponseEntity.ok(tickets);
    }

    /**
     * Get open tickets
     */
    @GetMapping("/open/list")
    public ResponseEntity<List<TicketResponse>> getOpenTickets() {
        List<TicketResponse> tickets = ticketService.getOpenTickets();
        return ResponseEntity.ok(tickets);
    }

    /**
     * Get dashboard stats
     */
    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        List<TicketResponse> allTickets = ticketService.getAllTickets();
        try {
            Map<String, Object> stats = Map.of(
                    "totalTickets", allTickets.size(),
                    "openTickets", ticketService.getOpenTickets().size(),
                    "criticalTickets", ticketService.getTicketsByPriority(Ticket.TicketPriority.CRITICAL).size(),
                    "highTickets", ticketService.getTicketsByPriority(Ticket.TicketPriority.HIGH).size(),
                    "resolvedTickets", ticketService.getTicketsByStatus(Ticket.TicketStatus.RESOLVED).size()
            );
            return ResponseEntity.ok(stats);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to load dashboard stats"));
        }
    }
}
