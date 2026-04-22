package com.smartcampus.service;

import com.smartcampus.dto.response.BroadcastBatchResponse;
import com.smartcampus.dto.response.BroadcastOutcomeResponse;
import com.smartcampus.exception.UserNotFoundException;
import com.smartcampus.model.BroadcastBatch;
import com.smartcampus.model.Notification;
import com.smartcampus.model.NotificationType;
import com.smartcampus.model.User;
import com.smartcampus.repository.BroadcastBatchRepository;
import com.smartcampus.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private static final int MAX_BROADCAST_MESSAGE_LENGTH = 2000;

    private final MongoTemplate mongoTemplate;
    private final NotificationRepository notificationRepository;
    private final BroadcastBatchRepository broadcastBatchRepository;
    private final UserService userService;

    /**
     * Called by booking/ticket modules when events occur. Pass the target user's id and a type string
     * (e.g. "BOOKING", "TICKET"); unknown types are stored as {@link NotificationType#OTHER}.
     */
    public Notification createNotification(String userId, String message, String type) {
        return createNotification(userId, message, type, null);
    }

    /**
     * Same as {@link #createNotification(String, String, String)} but tags rows from a campus-wide broadcast.
     */
    public Notification createNotification(String userId, String message, String type, String broadcastBatchId) {
        Notification notification = Notification.builder()
                .userId(userId)
                .message(message)
                .type(NotificationType.fromString(type))
                .read(false)
                .createdAt(LocalDateTime.now())
                .broadcastBatchId(broadcastBatchId)
                .build();
        Notification saved = notificationRepository.save(notification);
        log.debug("Created notification {} for user {}", saved.getId(), userId);
        return saved;
    }

    /**
     * Creates one SYSTEM notification per registered user (e.g. maintenance notice). In-app only.
     */
    public BroadcastOutcomeResponse broadcastSystemNotification(String message) {
        if (!StringUtils.hasText(message)) {
            throw new IllegalArgumentException("Message is required");
        }
        String trimmed = message.trim();
        if (trimmed.length() > MAX_BROADCAST_MESSAGE_LENGTH) {
            throw new IllegalArgumentException(
                    "Message must be at most " + MAX_BROADCAST_MESSAGE_LENGTH + " characters");
        }
        String batchId = UUID.randomUUID().toString();
        LocalDateTime createdAt = LocalDateTime.now();
        List<User> users = userService.getAllUsers();
        int count = 0;
        for (User u : users) {
            if (u.getId() == null || u.getId().isBlank()) {
                continue;
            }
            createNotification(u.getId(), trimmed, NotificationType.SYSTEM.name(), batchId);
            count++;
        }
        broadcastBatchRepository.save(BroadcastBatch.builder()
                .id(batchId)
                .message(trimmed)
                .createdAt(createdAt)
                .recipientCount(count)
                .build());
        log.info("Broadcast SYSTEM notification batch {} to {} users", batchId, count);
        return new BroadcastOutcomeResponse(count, batchId);
    }

    public List<BroadcastBatchResponse> listBroadcastBatches() {
        return broadcastBatchRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(b -> new BroadcastBatchResponse(
                        b.getId(),
                        b.getMessage(),
                        b.getCreatedAt(),
                        b.getRecipientCount()))
                .toList();
    }

    public void deleteBroadcastBatch(String batchId) {
        if (!StringUtils.hasText(batchId)) {
            throw new IllegalArgumentException("Batch id is required");
        }
        String id = batchId.trim();
        if (!broadcastBatchRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Broadcast not found");
        }
        notificationRepository.deleteAllByBroadcastBatchId(id);
        broadcastBatchRepository.deleteById(id);
        log.info("Deleted broadcast batch {} and related notifications", id);
    }

    public List<Notification> getNotificationsForCurrentUser(String typeFilter) {
        String userId = requireCurrentUserId();
        if (typeFilter != null && !typeFilter.isBlank()) {
            NotificationType t = NotificationType.fromString(typeFilter);
            return notificationRepository.findByUserIdAndTypeOrderByCreatedAtDesc(userId, t);
        }
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCountForCurrentUser() {
        String userId = requireCurrentUserId();
        return notificationRepository.countByUserIdAndRead(userId, false);
    }

    public void markAsReadForCurrentUser(String notificationId) {
        Notification n = loadOwnedNotification(notificationId);
        n.setRead(true);
        notificationRepository.save(n);
    }

    /** Marks every unread notification for the current user as read (Mongo field {@code isRead}). */
    public void markAllAsReadForCurrentUser() {
        String userId = requireCurrentUserId();
        Query query = new Query();
        query.addCriteria(Criteria.where("userId").is(userId).and("isRead").is(false));
        Update update = new Update().set("isRead", true);
        mongoTemplate.updateMulti(query, update, Notification.class);
    }

    public void deleteForCurrentUser(String notificationId) {
        Notification n = loadOwnedNotification(notificationId);
        notificationRepository.delete(n);
    }

    private Notification loadOwnedNotification(String notificationId) {
        String userId = requireCurrentUserId();
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        if (!userId.equals(n.getUserId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found");
        }
        return n;
    }

    private String requireCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        String email = auth.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + email));
        return user.getId();
    }
}
