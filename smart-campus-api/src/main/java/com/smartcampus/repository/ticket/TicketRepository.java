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

    List<Ticket> findByStatus(String status);

    List<Ticket> findByPriority(String priority);

    List<Ticket> findByAssignedTo(String assignedTo);

    List<Ticket> findByCreatedBy(String createdBy);

    List<Ticket> findByCategory(String category);

    @Query("{ 'status': ?0, 'priority': ?1 }")
    List<Ticket> findByStatusAndPriority(String status, String priority);

    @Query("{ 'createdAt': { $gte: ?0, $lte: ?1 } }")
    List<Ticket> findTicketsCreatedBetween(LocalDateTime startDate, LocalDateTime endDate);

    @Query("{ $or: [ { 'title': { $regex: ?0, $options: 'i' } }, { 'description': { $regex: ?0, $options: 'i' } } ] }")
    List<Ticket> searchTickets(String keyword);

    List<Ticket> findByStatusOrderByPriorityDesc(String status);

    @Query("{ 'status': { $in: ['OPEN', 'IN_PROGRESS'] } }")
    List<Ticket> findOpenTickets();
}
