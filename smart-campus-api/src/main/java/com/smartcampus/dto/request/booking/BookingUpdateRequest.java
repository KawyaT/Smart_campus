package com.smartcampus.dto.request.booking;

import java.time.LocalDate;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record BookingUpdateRequest(
    @NotBlank(message = "Resource id is required")
    String resourceId,

    String resourceName,

    @NotNull(message = "Booking date is required")
    @FutureOrPresent(message = "Booking date must be today or in the future")
    @JsonFormat(pattern = "yyyy-MM-dd")
    LocalDate bookingDate,

    @NotNull(message = "Start time is required")
    @JsonFormat(pattern = "HH:mm")
    LocalTime startTime,

    @NotNull(message = "End time is required")
    @JsonFormat(pattern = "HH:mm")
    LocalTime endTime,

    @NotBlank(message = "Purpose is required")
    @Size(max = 500, message = "Purpose must be 500 characters or less")
    String purpose,

    @Min(value = 1, message = "Expected attendees must be at least 1")
    Integer expectedAttendees
) {
}
