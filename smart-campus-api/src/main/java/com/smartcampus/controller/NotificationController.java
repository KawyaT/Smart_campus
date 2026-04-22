package com.smartcampus.controller;

import com.smartcampus.model.Notification;
import com.smartcampus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Notification>> list(@RequestParam(required = false) String type) {
        return ResponseEntity.ok(notificationService.getNotificationsForCurrentUser(type));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount() {
        long count = notificationService.getUnreadCountForCurrentUser();
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PutMapping("/mark-all-read")
    public ResponseEntity<Void> markAllRead() {
        notificationService.markAllAsReadForCurrentUser();
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable String id) {
        notificationService.markAsReadForCurrentUser(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        notificationService.deleteForCurrentUser(id);
        return ResponseEntity.noContent().build();
    }
}
