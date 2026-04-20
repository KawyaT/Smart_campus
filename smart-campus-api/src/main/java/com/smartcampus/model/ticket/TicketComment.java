package com.smartcampus.model.ticket;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "ticket_comments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketComment {
    @Id
    private String id;
    
    private String ticketId;
    private String authorId;
    private String authorName;
    private String content;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    private boolean isInternal; // Only visible to staff
    private CommentType type;
    
    public enum CommentType {
        COMMENT,
        STATUS_CHANGE,
        ASSIGNMENT_CHANGE,
        NOTE
    }
}
