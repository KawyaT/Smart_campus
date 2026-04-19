package com.smartcampus.controller;

import com.smartcampus.model.Notification;
import com.smartcampus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Lets admins (or support scripts) create a notification for any user by id — for testing until
 * booking/ticket modules call {@link NotificationService#createNotification} directly.
 */
@RestController
@RequestMapping("/api/admin/notifications")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminNotificationController {

    private final NotificationService notificationService;

    public record CreateNotificationRequest(String userId, String message, String type) {}

    @PostMapping
    public ResponseEntity<Notification> createForUser(@RequestBody CreateNotificationRequest body) {
        Notification created = notificationService.createNotification(
                body.userId(),
                body.message(),
                body.type() != null ? body.type() : "SYSTEM");
        return ResponseEntity.ok(created);
    }
}
