package com.smartcampus.dto.response.booking;

import java.time.LocalDateTime;

public record CheckInVerificationResponse(
    boolean valid,
    String message,
    String bookingId,
    String resourceId,
    LocalDateTime checkedInAt
) {
}
