package com.smartcampus.dto.responce;

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
public class TicketResponse {
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
    private String assignedToId;
    private String assignedToName;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime dueDate;
    
    private int estimatedHours;
    private int actualHours;
    private String resolutionNotes;
    
    private List<String> commentIds;
    private int commentCount;
    
    private List<String> tags;
    private String department;
    private String facility;
    private String imageBase64;
    
    private int satisfactionRating;
    private String feedback;
    
    private boolean isOverdue;
}
