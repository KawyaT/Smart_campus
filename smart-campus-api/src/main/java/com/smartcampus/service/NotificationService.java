package com.smartcampus.service;

import com.smartcampus.exception.UserNotFoundException;
import com.smartcampus.model.Notification;
import com.smartcampus.model.NotificationType;
import com.smartcampus.model.User;
import com.smartcampus.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserService userService;

    /**
     * Called by booking/ticket modules when events occur. Pass the target user's id and a type string
     * (e.g. "BOOKING", "TICKET"); unknown types are stored as {@link NotificationType#OTHER}.
     */
    public Notification createNotification(String userId, String message, String type) {
        Notification notification = Notification.builder()
                .userId(userId)
                .message(message)
                .type(NotificationType.fromString(type))
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();
        Notification saved = notificationRepository.save(notification);
        log.debug("Created notification {} for user {}", saved.getId(), userId);
        return saved;
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
