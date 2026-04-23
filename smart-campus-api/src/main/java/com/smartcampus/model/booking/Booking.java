package com.smartcampus.model.booking;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("bookings")
public class Booking {

    @Id
    private String id;

    @Indexed
    private String requesterId;

    private String requesterName;

    @Indexed
    private String resourceId;

    private String resourceName;

    @Indexed
    private LocalDate bookingDate;

    private LocalTime startTime;

    private LocalTime endTime;

    private String purpose;

    private Integer expectedAttendees;

    @Indexed
    private BookingStatus status;

    @Indexed(unique = true, sparse = true)
    private String qrToken;

    private boolean qrGenerated;

    private boolean qrUsed;

    private String decisionReason;

    private String reviewedById;

    private String reviewedByName;

    private LocalDateTime reviewedAt;

    private String cancellationReason;

    private LocalDateTime cancelledAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
