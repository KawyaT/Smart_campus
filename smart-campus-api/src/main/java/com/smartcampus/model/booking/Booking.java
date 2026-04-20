package com.smartcampus.model.booking;

<<<<<<< feature/bookings
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
=======
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
>>>>>>> dev
public class Booking {

    @Id
    private String id;

<<<<<<< feature/bookings
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

    private String decisionReason;

    private String reviewedById;

    private String reviewedByName;

    private LocalDateTime reviewedAt;

    private String cancellationReason;

    private LocalDateTime cancelledAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
=======
    private String title;
    private String purpose;
    private String facilityId;
    private String facilityName;
    private String bookedBy;
    private int attendees;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BookingStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public enum BookingStatus {
        PENDING,
        APPROVED,
        REJECTED,
        CANCELLED,
        COMPLETED
    }
}
>>>>>>> dev
