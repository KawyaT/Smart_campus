package com.smartcampus.model;

/**
 * Types used when creating notifications from booking/ticket modules.
 * Unknown strings map to {@link #OTHER}.
 */
public enum NotificationType {
    BOOKING,
    TICKET,
    SYSTEM,
    COMMENT,
    OTHER;

    public static NotificationType fromString(String value) {
        if (value == null || value.isBlank()) {
            return OTHER;
        }
        try {
            return NotificationType.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return OTHER;
        }
    }
}
