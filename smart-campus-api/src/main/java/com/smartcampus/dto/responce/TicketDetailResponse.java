package com.smartcampus.dto.responce;

import com.smartcampus.model.ticket.Ticket;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketDetailResponse {
    private String id;
    private String title;
    private String description;
    private String category;
    private String location;
    
    private String status;
    private String priority;
    private String severity;
    
    private String reporterId;
    private String reporterName;
    private String reporterEmail;
    private String assignedToId;
    private String assignedToName;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime dueDate;
    
    private int estimatedHours;
    private int actualHours;
    private String resolutionNotes;
    
    private List<TicketCommentDTO> comments;
    private int commentCount;
    
    private List<String> tags;
    private String department;
    private String facility;
    
    private int satisfactionRating;
    private String feedback;
    private String imageBase64;
    private List<String> imageGalleryBase64;
    
    private boolean isOverdue;
    
    public static TicketDetailResponse fromTicket(Ticket ticket) {
        return TicketDetailResponse.builder()
                .id(ticket.getId())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .category(ticket.getCategory())
                .location(ticket.getLocation())
                .status(ticket.getStatus() != null ? ticket.getStatus().toString() : null)
                .priority(ticket.getPriority() != null ? ticket.getPriority().toString() : null)
                .severity(ticket.getSeverity() != null ? ticket.getSeverity().toString() : null)
                .reporterId(ticket.getReporterId())
                .reporterName(ticket.getReporterName())
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
                .commentCount(ticket.getCommentCount())
                .tags(ticket.getTags())
                .department(ticket.getDepartment())
                .facility(ticket.getFacility())
                .imageBase64(ticket.getImageBase64())
                .imageGalleryBase64(ticket.getImageGalleryBase64())
                .satisfactionRating(ticket.getSatisfactionRating())
                .feedback(ticket.getFeedback())
                .isOverdue(ticket.isOverdue())
                .build();
    }
}
