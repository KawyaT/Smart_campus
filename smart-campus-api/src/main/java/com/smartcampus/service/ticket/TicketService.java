package com.smartcampus.service.ticket;

import com.smartcampus.dto.request.CreateTicketRequest;
import com.smartcampus.dto.request.UpdateTicketRequest;
import com.smartcampus.dto.responce.TicketResponse;
import com.smartcampus.model.ticket.Ticket;
import com.smartcampus.repository.ticket.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    /**
     * Create a new ticket
     */
    public TicketResponse createTicket(CreateTicketRequest request, String createdBy) {
        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setCategory(request.getCategory());
        ticket.setPriority(request.getPriority());
        ticket.setCreatedBy(createdBy);
        ticket.setLocation(request.getLocation());
        ticket.setEstimatedDays(request.getEstimatedDays());
        ticket.setAttachmentUrl(request.getAttachmentUrl());

        Ticket savedTicket = ticketRepository.save(ticket);
        return convertToResponse(savedTicket);
    }

    /**
     * Get all tickets
     */
    public List<TicketResponse> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get ticket by ID
     */
    public Optional<TicketResponse> getTicketById(String id) {
        return ticketRepository.findById(id)
                .map(this::convertToResponse);
    }

    /**
     * Update ticket
     */
    public Optional<TicketResponse> updateTicket(String id, UpdateTicketRequest request) {
        return ticketRepository.findById(id).map(ticket -> {
            if (request.getTitle() != null) ticket.setTitle(request.getTitle());
            if (request.getDescription() != null) ticket.setDescription(request.getDescription());
            if (request.getCategory() != null) ticket.setCategory(request.getCategory());
            if (request.getPriority() != null) ticket.setPriority(request.getPriority());
            if (request.getStatus() != null) {
                ticket.setStatus(request.getStatus());
                if ("RESOLVED".equals(request.getStatus()) || "CLOSED".equals(request.getStatus())) {
                    ticket.setResolvedAt(LocalDateTime.now());
                }
            }
            if (request.getAssignedTo() != null) ticket.setAssignedTo(request.getAssignedTo());
            if (request.getLocation() != null) ticket.setLocation(request.getLocation());
            if (request.getResolution() != null) ticket.setResolution(request.getResolution());
            if (request.getNotes() != null) ticket.setNotes(request.getNotes());
            if (request.getEstimatedDays() > 0) ticket.setEstimatedDays(request.getEstimatedDays());

            ticket.setUpdatedAt(LocalDateTime.now());
            Ticket updatedTicket = ticketRepository.save(ticket);
            return convertToResponse(updatedTicket);
        });
    }

    /**
     * Delete ticket
     */
    public boolean deleteTicket(String id) {
        if (ticketRepository.existsById(id)) {
            ticketRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /**
     * Get tickets by status
     */
    public List<TicketResponse> getTicketsByStatus(String status) {
        return ticketRepository.findByStatus(status).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get tickets by priority
     */
    public List<TicketResponse> getTicketsByPriority(String priority) {
        return ticketRepository.findByPriority(priority).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get tickets assigned to user
     */
    public List<TicketResponse> getTicketsAssignedTo(String userId) {
        return ticketRepository.findByAssignedTo(userId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get tickets created by user
     */
    public List<TicketResponse> getTicketsCreatedBy(String userId) {
        return ticketRepository.findByCreatedBy(userId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get tickets by category
     */
    public List<TicketResponse> getTicketsByCategory(String category) {
        return ticketRepository.findByCategory(category).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Search tickets by keyword
     */
    public List<TicketResponse> searchTickets(String keyword) {
        return ticketRepository.searchTickets(keyword).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get open tickets (OPEN or IN_PROGRESS)
     */
    public List<TicketResponse> getOpenTickets() {
        return ticketRepository.findOpenTickets().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get tickets by date range
     */
    public List<TicketResponse> getTicketsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return ticketRepository.findTicketsCreatedBetween(startDate, endDate).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Convert Ticket entity to TicketResponse DTO
     */
    private TicketResponse convertToResponse(Ticket ticket) {
        TicketResponse response = new TicketResponse();
        response.setId(ticket.getId());
        response.setTitle(ticket.getTitle());
        response.setDescription(ticket.getDescription());
        response.setCategory(ticket.getCategory());
        response.setPriority(ticket.getPriority());
        response.setStatus(ticket.getStatus());
        response.setAssignedTo(ticket.getAssignedTo());
        response.setCreatedBy(ticket.getCreatedBy());
        response.setCreatedAt(ticket.getCreatedAt());
        response.setUpdatedAt(ticket.getUpdatedAt());
        response.setResolvedAt(ticket.getResolvedAt());
        response.setLocation(ticket.getLocation());
        response.setAttachmentUrl(ticket.getAttachmentUrl());
        response.setEstimatedDays(ticket.getEstimatedDays());
        response.setResolution(ticket.getResolution());
        response.setNotes(ticket.getNotes());
        return response;
    }
}
