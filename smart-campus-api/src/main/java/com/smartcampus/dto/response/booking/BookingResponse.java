package com.smartcampus.dto.response.booking;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.smartcampus.model.booking.BookingStatus;

public record BookingResponse(
    String id,
    String requesterId,
    String requesterName,
    String resourceId,
    String resourceName,
    @JsonFormat(pattern = "yyyy-MM-dd")
    LocalDate bookingDate,
    @JsonFormat(pattern = "HH:mm")
    LocalTime startTime,
    @JsonFormat(pattern = "HH:mm")
    LocalTime endTime,
    String purpose,
    Integer expectedAttendees,
    BookingStatus status,
    boolean qrGenerated,
    boolean qrUsed,
    String decisionReason,
    String cancellationReason,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
}