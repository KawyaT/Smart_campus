package com.smartcampus.dto.request;

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
public class UpdateTicketRequest {

    private String title;
    private String description;
    private String category;
    private String priority;
    private String severity;
    private String status;
    private String assignedToId;
    private String location;
    private String facility;
    private String department;
    
    private String resolutionNotes;
    private int actualHours;
    private LocalDateTime dueDate;
    
    private List<String> tags;
    private int satisfactionRating;
    private String feedback;
}
