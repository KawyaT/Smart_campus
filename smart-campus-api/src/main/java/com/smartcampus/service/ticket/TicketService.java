package com.smartcampus.service.ticket;

import com.smartcampus.dto.request.CreateTicketRequest;
import com.smartcampus.dto.request.UpdateTicketRequest;
import com.smartcampus.dto.responce.*;
import com.smartcampus.model.User;
import com.smartcampus.model.ticket.Ticket;
import com.smartcampus.model.ticket.TicketComment;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.repository.ticket.TicketRepository;
import com.smartcampus.repository.ticket.TicketCommentRepository;
import com.smartcampus.service.NotificationService;
import com.smartcampus.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;
    
    @Autowired
    private TicketCommentRepository commentRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    public TicketResponse createTicket(CreateTicketRequest request, String reporterId, String reporterName, String reporterEmail) {
        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setCategory(request.getCategory());
        ticket.setPriority(Ticket.TicketPriority.valueOf(request.getPriority().toUpperCase()));
        ticket.setSeverity(request.getSeverity() != null ? Ticket.TicketSeverity.valueOf(request.getSeverity().toUpperCase()) : Ticket.TicketSeverity.MINOR);
        ticket.setStatus(Ticket.TicketStatus.OPEN);
        ticket.setReporterId(reporterId);
        ticket.setReporterName(reporterName);
        if (reporterEmail != null && !reporterEmail.isBlank()) {
            ticket.setReporterEmail(reporterEmail.trim());
        }
        ticket.setLocation(request.getLocation());
        ticket.setFacility(request.getFacility());
        ticket.setDepartment(request.getDepartment());
        ticket.setEstimatedHours(request.getEstimatedHours());
        ticket.setDueDate(request.getDueDate());
        ticket.setTags(request.getTags() != null ? request.getTags() : new ArrayList<>());
        ticket.setImageBase64(request.getImageBase64() != null ? request.getImageBase64() : request.getAttachmentUrl());
        ticket.setImageGalleryBase64(request.getImageGalleryBase64() != null ? request.getImageGalleryBase64() : new ArrayList<>());
        ticket.setCommentIds(new ArrayList<>());
        ticket.setCommentCount(0);

        Ticket savedTicket = ticketRepository.save(ticket);
        notifyTicketUser(
            savedTicket.getReporterId(),
            "Your ticket \"" + shortenTicketTitle(savedTicket.getTitle()) + "\" was submitted."
        );
        return convertToResponse(savedTicket);
    }

    public List<TicketResponse> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public TicketDetailResponse getTicketById(String id) {
        Optional<Ticket> ticket = ticketRepository.findById(id);
        if (ticket.isEmpty()) {
            throw new RuntimeException("Ticket not found");
        }
        
        Ticket ticketEntity = ticket.get();
        TicketDetailResponse detail = TicketDetailResponse.fromTicket(ticketEntity);
        detail.setReporterName(effectiveReporterName(ticketEntity));
        List<TicketComment> comments = commentRepository.findByTicketId(id);
        detail.setComments(comments.stream()
                .map(this::convertCommentToDTO)
                .collect(Collectors.toList()));
        
        return detail;
    }

    public TicketResponse updateTicket(String id, UpdateTicketRequest request) {
        Optional<Ticket> ticketOpt = ticketRepository.findById(id);
        if (ticketOpt.isEmpty()) {
            throw new RuntimeException("Ticket not found");
        }

        Ticket ticket = ticketOpt.get();
        Ticket.TicketStatus previousStatus = ticket.getStatus();
        String previousAssigneeId = ticket.getAssignedToId();
        String previousAssigneeName = ticket.getAssignedToName();
        
        if (request.getTitle() != null) ticket.setTitle(request.getTitle());
        if (request.getDescription() != null) ticket.setDescription(request.getDescription());
        if (request.getCategory() != null) ticket.setCategory(request.getCategory());
        if (request.getPriority() != null) ticket.setPriority(Ticket.TicketPriority.valueOf(request.getPriority().toUpperCase()));
        if (request.getSeverity() != null) ticket.setSeverity(Ticket.TicketSeverity.valueOf(request.getSeverity().toUpperCase()));
        if (request.getStatus() != null) ticket.setStatus(Ticket.TicketStatus.valueOf(request.getStatus().toUpperCase()));
        if (request.getAssignedToId() != null) ticket.setAssignedToId(request.getAssignedToId());
        if (request.getAssignedToName() != null) ticket.setAssignedToName(request.getAssignedToName());
        if (request.getLocation() != null) ticket.setLocation(request.getLocation());
        if (request.getFacility() != null) ticket.setFacility(request.getFacility());
        if (request.getDepartment() != null) ticket.setDepartment(request.getDepartment());
        if (request.getDueDate() != null) ticket.setDueDate(request.getDueDate());
        if (request.getResolutionNotes() != null) ticket.setResolutionNotes(request.getResolutionNotes());
        if (request.getActualHours() > 0) ticket.setActualHours(request.getActualHours());
        if (request.getTags() != null) ticket.setTags(request.getTags());
        if (request.getImageBase64() != null) ticket.setImageBase64(request.getImageBase64());
        if (request.getImageGalleryBase64() != null) ticket.setImageGalleryBase64(request.getImageGalleryBase64());
        
        if (request.getSatisfactionRating() > 0) {
            ticket.setSatisfactionRating(request.getSatisfactionRating());
        }
        if (request.getFeedback() != null) {
            ticket.setFeedback(request.getFeedback());
            ticket.setFeedbackProvided(true);
        }
        
        if (ticket.getStatus() == Ticket.TicketStatus.RESOLVED || ticket.getStatus() == Ticket.TicketStatus.CLOSED) {
            ticket.setResolvedAt(LocalDateTime.now());
        }
        
        ticket.setUpdatedAt(LocalDateTime.now());
        Ticket updatedTicket = ticketRepository.save(ticket);

        String shortTitle = shortenTicketTitle(updatedTicket.getTitle());

        if (request.getStatus() != null && previousStatus != updatedTicket.getStatus()) {
            addEvent(
                    id,
                    "system",
                    "System",
                    "Status changed from " + previousStatus + " to " + updatedTicket.getStatus(),
                    TicketComment.CommentType.STATUS_CHANGE.toString(),
                    false
            );
            notifyTicketUser(
                    updatedTicket.getReporterId(),
                    "Ticket \"" + shortTitle + "\" status changed to " + updatedTicket.getStatus() + "."
            );
        }

        if (request.getAssignedToId() != null && !Objects.equals(previousAssigneeId, updatedTicket.getAssignedToId())) {
            String oldAssignee = previousAssigneeName != null ? previousAssigneeName : "Unassigned";
            String newAssignee = updatedTicket.getAssignedToName() != null ? updatedTicket.getAssignedToName() : updatedTicket.getAssignedToId();
            addEvent(
                    id,
                    "system",
                    "System",
                    "Assignment changed from " + oldAssignee + " to " + (newAssignee != null ? newAssignee : "Unassigned"),
                    TicketComment.CommentType.ASSIGNMENT_CHANGE.toString(),
                    true
            );
            if (StringUtils.hasText(updatedTicket.getAssignedToId())) {
                notifyTicketUser(
                        updatedTicket.getAssignedToId(),
                        "You were assigned to ticket \"" + shortTitle + "\"."
                );
            }
            if (StringUtils.hasText(updatedTicket.getReporterId())) {
                notifyTicketUser(
                        updatedTicket.getReporterId(),
                        "Your ticket \"" + shortTitle + "\" was reassigned to "
                                + (newAssignee != null ? newAssignee : "staff") + "."
                );
            }
        }

        return convertToResponse(updatedTicket);
    }

    public void deleteTicket(String id) {
        ticketRepository.deleteById(id);
        commentRepository.deleteAll(commentRepository.findByTicketId(id));
    }

    public List<TicketResponse> searchTickets(String keyword) {
        return ticketRepository.searchTickets(keyword).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<TicketResponse> getTicketsByStatus(Ticket.TicketStatus status) {
        return ticketRepository.findByStatus(status).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<TicketResponse> getTicketsByPriority(Ticket.TicketPriority priority) {
        return ticketRepository.findByPriority(priority).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<TicketResponse> getTicketsByCategory(String category) {
        return ticketRepository.findByCategory(category).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<TicketResponse> getTicketsByDepartment(String department) {
        return ticketRepository.findByDepartment(department).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<TicketResponse> getTicketsByAssignee(String assignedToId) {
        return ticketRepository.findByAssignedToId(assignedToId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<TicketResponse> getOverdueTickets() {
        return ticketRepository.findOverdueTickets().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<TicketResponse> getOpenTickets() {
        return ticketRepository.findOpenTickets().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public TicketCommentDTO addComment(String ticketId, String authorId, String authorName, String content, boolean isInternal) {
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        if (ticketOpt.isEmpty()) {
            throw new RuntimeException("Ticket not found");
        }

        TicketComment comment = new TicketComment();
        comment.setTicketId(ticketId);
        comment.setAuthorId(authorId);
        comment.setAuthorName(authorName);
        comment.setContent(content);
        comment.setInternal(isInternal);
        comment.setType(TicketComment.CommentType.COMMENT);
        comment.setCreatedAt(LocalDateTime.now());
        comment.setUpdatedAt(LocalDateTime.now());

        TicketComment savedComment = commentRepository.save(comment);
        
        Ticket ticket = ticketOpt.get();
        ticket.getCommentIds().add(savedComment.getId());
        ticket.setCommentCount(ticket.getCommentCount() + 1);
        ticketRepository.save(ticket);

        if (!isInternal) {
            String shortTitle = shortenTicketTitle(ticket.getTitle());
            String msg = "New comment on ticket \"" + shortTitle + "\".";
            if (StringUtils.hasText(ticket.getReporterId()) && !ticket.getReporterId().equals(authorId)) {
                notifyCommentUser(ticket.getReporterId(), msg);
            }
            if (StringUtils.hasText(ticket.getAssignedToId()) && !ticket.getAssignedToId().equals(authorId)) {
                notifyCommentUser(ticket.getAssignedToId(), msg);
            }
        }

        return convertCommentToDTO(savedComment);
    }

    public List<TicketCommentDTO> getTicketComments(String ticketId) {
        return commentRepository.findByTicketId(ticketId).stream()
                .map(this::convertCommentToDTO)
                .collect(Collectors.toList());
    }

    public List<TicketCommentDTO> getTicketEvents(String ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId).stream()
                .filter(comment -> comment.getType() != TicketComment.CommentType.COMMENT)
                .map(this::convertCommentToDTO)
                .collect(Collectors.toList());
    }

    public TicketCommentDTO addEvent(String ticketId, String authorId, String authorName, String content, String type, boolean isInternal) {
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        if (ticketOpt.isEmpty()) {
            throw new RuntimeException("Ticket not found");
        }

        TicketComment.CommentType eventType;
        try {
            eventType = TicketComment.CommentType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException ex) {
            eventType = TicketComment.CommentType.NOTE;
        }

        TicketComment event = new TicketComment();
        event.setTicketId(ticketId);
        event.setAuthorId(authorId);
        event.setAuthorName(authorName);
        event.setContent(content);
        event.setInternal(isInternal);
        event.setType(eventType);
        event.setCreatedAt(LocalDateTime.now());
        event.setUpdatedAt(LocalDateTime.now());

        TicketComment savedEvent = commentRepository.save(event);
        return convertCommentToDTO(savedEvent);
    }

    public TicketAnalyticsResponse getAnalytics() {
        List<Ticket> allTickets = ticketRepository.findAll();
        
        Map<String, Integer> byCategory = new HashMap<>();
        Map<String, Integer> byDepartment = new HashMap<>();
        Map<String, Integer> byPriority = new HashMap<>();
        
        int criticalCount = 0, highCount = 0, mediumCount = 0, lowCount = 0;
        int totalResolved = 0;
        double totalResolutionTime = 0;
        double totalRating = 0;
        int ratedTickets = 0;

        for (Ticket ticket : allTickets) {
            byCategory.put(ticket.getCategory(), byCategory.getOrDefault(ticket.getCategory(), 0) + 1);
            byDepartment.put(ticket.getDepartment(), byDepartment.getOrDefault(ticket.getDepartment(), 0) + 1);
            
            if (ticket.getPriority() != null) {
                byPriority.put(ticket.getPriority().toString(), byPriority.getOrDefault(ticket.getPriority().toString(), 0) + 1);
                
                switch (ticket.getPriority()) {
                    case CRITICAL: criticalCount++; break;
                    case HIGH: highCount++; break;
                    case MEDIUM: mediumCount++; break;
                    case LOW: lowCount++; break;
                }
            }
            
            if (ticket.getStatus() == Ticket.TicketStatus.RESOLVED || ticket.getStatus() == Ticket.TicketStatus.CLOSED) {
                totalResolved++;
                if (ticket.getResolvedAt() != null) {
                    long hours = ChronoUnit.HOURS.between(ticket.getCreatedAt(), ticket.getResolvedAt());
                    totalResolutionTime += hours;
                }
            }
            
            if (ticket.getSatisfactionRating() > 0) {
                totalRating += ticket.getSatisfactionRating();
                ratedTickets++;
            }
        }

        double avgResolutionTime = totalResolved > 0 ? totalResolutionTime / totalResolved : 0;
        double avgRating = ratedTickets > 0 ? totalRating / ratedTickets : 0;
        double resolutionRate = allTickets.size() > 0 ? (totalResolved * 100.0) / allTickets.size() : 0;

        return TicketAnalyticsResponse.builder()
                .totalTickets(allTickets.size())
                .openTickets((int) allTickets.stream().filter(t -> t.getStatus() == Ticket.TicketStatus.OPEN).count())
                .inProgressTickets((int) allTickets.stream().filter(t -> t.getStatus() == Ticket.TicketStatus.IN_PROGRESS).count())
                .resolvedTickets((int) allTickets.stream().filter(t -> t.getStatus() == Ticket.TicketStatus.RESOLVED).count())
                .closedTickets((int) allTickets.stream().filter(t -> t.getStatus() == Ticket.TicketStatus.CLOSED).count())
                .criticalTickets(criticalCount)
                .highTickets(highCount)
                .mediumTickets(mediumCount)
                .lowTickets(lowCount)
                .averageResolutionTime(avgResolutionTime)
                .averageSatisfactionRating(avgRating)
                .ticketsByCategory(byCategory)
                .ticketsByDepartment(byDepartment)
                .ticketsByPriority(byPriority)
                .resolutionRate(resolutionRate)
                .build();
    }

    private void notifyTicketUser(String userId, String message) {
        if (!StringUtils.hasText(userId)) {
            return;
        }
        try {
            notificationService.createNotification(userId.trim(), message, "TICKET");
        } catch (Exception ex) {
            log.warn("Could not create ticket notification for user {}: {}", userId, ex.getMessage());
        }
    }

    private void notifyCommentUser(String userId, String message) {
        if (!StringUtils.hasText(userId)) {
            return;
        }
        try {
            notificationService.createNotification(userId.trim(), message, "COMMENT");
        } catch (Exception ex) {
            log.warn("Could not create comment notification for user {}: {}", userId, ex.getMessage());
        }
    }

    private static String shortenTicketTitle(String title) {
        if (title == null) {
            return "";
        }
        String t = title.trim();
        return t.length() <= 80 ? t : t.substring(0, 77) + "...";
    }

    /**
     * Legacy rows may store "Current User" while {@code reporterId} points at a real account — resolve for admin lists/details.
     */
    private String effectiveReporterName(Ticket ticket) {
        String stored = ticket.getReporterName();
        String rid = ticket.getReporterId();
        if (!needsReporterNameEnrichment(stored)) {
            return stored != null ? stored : "";
        }
        if (rid != null && !rid.isBlank()) {
            Optional<User> opt = userRepository.findById(rid);
            if (opt.isPresent()) {
                return UserService.resolveDisplayName(opt.get());
            }
        }
        String email = ticket.getReporterEmail();
        if (email != null && !email.isBlank()) {
            Optional<User> byEmail = userRepository.findByEmail(email.trim());
            if (byEmail.isPresent()) {
                return UserService.resolveDisplayName(byEmail.get());
            }
        }
        return stored != null ? stored : "";
    }

    private static boolean needsReporterNameEnrichment(String storedName) {
        if (storedName == null || storedName.isBlank()) {
            return true;
        }
        return "current user".equalsIgnoreCase(storedName.trim());
    }

    private TicketResponse convertToResponse(Ticket ticket) {
        return TicketResponse.builder()
                .id(ticket.getId())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .category(ticket.getCategory())
                .location(ticket.getLocation())
                .status(ticket.getStatus() != null ? ticket.getStatus().toString() : "")
                .priority(ticket.getPriority() != null ? ticket.getPriority().toString() : "")
                .severity(ticket.getSeverity() != null ? ticket.getSeverity().toString() : "")
            .reporterId(ticket.getReporterId())
                .reporterName(effectiveReporterName(ticket))
                .reporterEmail(ticket.getReporterEmail())
            .assignedToId(ticket.getAssignedToId())
                .assignedToName(ticket.getAssignedToName())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .resolvedAt(ticket.getResolvedAt())
                .dueDate(ticket.getDueDate())
            .estimatedHours(ticket.getEstimatedHours())
            .actualHours(ticket.getActualHours())
            .resolutionNotes(ticket.getResolutionNotes())
            .commentIds(ticket.getCommentIds())
                .commentCount(ticket.getCommentCount())
                .tags(ticket.getTags())
            .department(ticket.getDepartment())
            .facility(ticket.getFacility())
            .imageBase64(ticket.getImageBase64())
            .imageGalleryBase64(ticket.getImageGalleryBase64())
            .feedback(ticket.getFeedback())
            .isOverdue(ticket.isOverdue())
                .satisfactionRating(ticket.getSatisfactionRating())
                .build();
    }

    private TicketCommentDTO convertCommentToDTO(TicketComment comment) {
        return TicketCommentDTO.builder()
                .id(comment.getId())
                .authorId(comment.getAuthorId())
                .authorName(comment.getAuthorName())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .isInternal(comment.isInternal())
                .type(comment.getType() != null ? comment.getType().toString() : "")
                .build();
    }
}
