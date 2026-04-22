package com.smartcampus.model.ticket;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "tickets")
@Data
@AllArgsConstructor
public class Ticket {

    @Id
    private String id;

    // Basic info
    private String title;
    private String description;
    private String category;
    private String location;
    
    // Status & Priority
    private TicketStatus status;
    private TicketPriority priority;
    private TicketSeverity severity;
    
    // Assignments
    private String reporterId;
    private String reporterName;
    /** Persisted from authenticated reporter at creation; used to resolve display name when legacy reporterId does not match a User row. */
    private String reporterEmail;
    private String assignedToId;
    private String assignedToName;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime dueDate;
    
    // Tracking
    private int estimatedHours;
    private int actualHours;
    private String resolutionNotes;
    
    // Comments & Activity
    private List<String> commentIds;
    private int commentCount;
    
    // Tags & Metadata
    private List<String> tags;
    private String department;
    private String facility;
    
    // Attachments
    private String imageBase64;
    private List<String> imageGalleryBase64;
    
    // Ratings
    private int satisfactionRating;
    private String feedback;
    private boolean feedbackProvided;

    // Constructors
    public Ticket() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = TicketStatus.OPEN;
        this.commentIds = new ArrayList<>();
        this.tags = new ArrayList<>();
        this.imageGalleryBase64 = new ArrayList<>();
    }

    public Ticket(String title, String description, String category, TicketPriority priority) {
        this();
        this.title = title;
        this.description = description;
        this.category = category;
        this.priority = priority;
    }

    // Enums
    public enum TicketStatus {
        OPEN,
        IN_PROGRESS,
        ON_HOLD,
        RESOLVED,
        CLOSED,
        REJECTED
    }

    public enum TicketPriority {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }

    public enum TicketSeverity {
        MINOR,
        MAJOR,
        SEVERE,
        BLOCKING
    }

    // Utility methods
    public boolean isOverdue() {
        if (dueDate == null || status == TicketStatus.RESOLVED || status == TicketStatus.CLOSED) {
            return false;
        }
        return LocalDateTime.now().isAfter(dueDate);
    }

    public int getResolutionTime() {
        if (resolvedAt == null) {
            return 0;
        }
        return (int) java.time.temporal.ChronoUnit.HOURS.between(createdAt, resolvedAt);
    }
}
