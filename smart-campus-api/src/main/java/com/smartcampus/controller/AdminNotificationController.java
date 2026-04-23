package com.smartcampus.controller;

import com.smartcampus.dto.response.BroadcastBatchResponse;
import com.smartcampus.dto.response.BroadcastOutcomeResponse;
import com.smartcampus.model.Notification;
import com.smartcampus.service.NotificationService;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Admin-only: send a notification to one user, or broadcast a SYSTEM message to all users (in-app only).
 */
@RestController
@RequestMapping("/api/admin/notifications")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminNotificationController {

    private final NotificationService notificationService;

    public record CreateNotificationRequest(String userId, String message, String type) {}

    public record BroadcastSystemRequest(String message) {}

    @PostMapping
    public ResponseEntity<Notification> createForUser(@RequestBody CreateNotificationRequest body) {
        Notification created = notificationService.createNotification(
                body.userId(),
                body.message(),
                body.type() != null ? body.type() : "SYSTEM");
        return ResponseEntity.ok(created);
    }

    /**
     * Sends the same SYSTEM notification to every user (e.g. planned downtime). No email is sent.
     */
    @PostMapping("/broadcast")
    public ResponseEntity<Map<String, Object>> broadcastSystem(@RequestBody BroadcastSystemRequest body) {
        BroadcastOutcomeResponse outcome = notificationService.broadcastSystemNotification(body.message());
        return ResponseEntity.ok(Map.of(
                "type", "SYSTEM",
                "sentToUsers", outcome.sentToUsers(),
                "broadcastId", outcome.broadcastId()));
    }

    @GetMapping("/broadcasts")
    public ResponseEntity<List<BroadcastBatchResponse>> listBroadcasts() {
        return ResponseEntity.ok(notificationService.listBroadcastBatches());
    }

    /**
     * Removes this broadcast from history and deletes all user copies (in-app notifications).
     */
    @DeleteMapping("/broadcasts/{batchId}")
    public ResponseEntity<Void> deleteBroadcast(@PathVariable String batchId) {
        notificationService.deleteBroadcastBatch(batchId);
        return ResponseEntity.noContent().build();
    }
}
