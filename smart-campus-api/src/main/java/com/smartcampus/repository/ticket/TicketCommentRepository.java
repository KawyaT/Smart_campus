package com.smartcampus.repository.ticket;

import com.smartcampus.model.ticket.TicketComment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TicketCommentRepository extends MongoRepository<TicketComment, String> {
    
    List<TicketComment> findByTicketId(String ticketId);
    
    List<TicketComment> findByAuthorId(String authorId);
    
    List<TicketComment> findByTicketIdAndIsInternalFalse(String ticketId);
}
