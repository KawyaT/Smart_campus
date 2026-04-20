package com.smartcampus.repository.ticket;

import com.smartcampus.model.ticket.Ticket;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {

    List<Ticket> findByStatus(Ticket.TicketStatus status);

    List<Ticket> findByPriority(Ticket.TicketPriority priority);

    List<Ticket> findBySeverity(Ticket.TicketSeverity severity);

    List<Ticket> findByAssignedToId(String assignedToId);

    List<Ticket> findByReporterId(String reporterId);

    List<Ticket> findByCategory(String category);

    List<Ticket> findByDepartment(String department);

    List<Ticket> findByLocation(String location);

    @Query("{ 'status': ?0, 'priority': ?1 }")
    List<Ticket> findByStatusAndPriority(Ticket.TicketStatus status, Ticket.TicketPriority priority);

    @Query("{ 'createdAt': { $gte: ?0, $lte: ?1 } }")
    List<Ticket> findTicketsCreatedBetween(LocalDateTime startDate, LocalDateTime endDate);

    @Query("{ $or: [ { 'title': { $regex: ?0, $options: 'i' } }, { 'description': { $regex: ?0, $options: 'i' } } ] }")
    List<Ticket> searchTickets(String keyword);

    List<Ticket> findByStatusOrderByPriorityDesc(Ticket.TicketStatus status);

    @Query("{ 'status': { $in: ['OPEN', 'IN_PROGRESS'] } }")
    List<Ticket> findOpenTickets();
    
    @Query("{ 'dueDate': { $lt: new Date() }, 'status': { $in: ['OPEN', 'IN_PROGRESS'] } }")
    List<Ticket> findOverdueTickets();
    
    @Query("{ 'tags': ?0 }")
    List<Ticket> findByTag(String tag);
    
    @Query("{ 'feedbackProvided': false, 'status': 'CLOSED' }")
    List<Ticket> findClosedTicketsWithoutFeedback();
}
