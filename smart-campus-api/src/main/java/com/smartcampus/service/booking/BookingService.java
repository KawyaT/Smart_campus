package com.smartcampus.service.booking;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.EnumSet;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.smartcampus.dto.request.booking.BookingCreateRequest;
import com.smartcampus.dto.response.booking.BookingResponse;
import com.smartcampus.model.booking.Booking;
import com.smartcampus.model.booking.BookingStatus;
import com.smartcampus.repository.booking.BookingRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingService {

    private static final EnumSet<BookingStatus> ACTIVE_BOOKING_STATUSES = EnumSet.of(
        BookingStatus.PENDING,
        BookingStatus.APPROVED
    );

    private final BookingRepository bookingRepository;

    public BookingResponse createBooking(BookingCreateRequest request, String requesterId, String requesterName) {
        validateTimeRange(request.startTime(), request.endTime());
        validateSameDayNotInPast(request.bookingDate(), request.startTime());
        ensureNoConflict(request.resourceId(), request.bookingDate(), request.startTime(), request.endTime());

        Booking booking = Booking.builder()
            .requesterId(requesterId)
            .requesterName(normalizeOptional(requesterName))
            .resourceId(request.resourceId().trim())
            .resourceName(normalizeOptional(request.resourceName()))
            .bookingDate(request.bookingDate())
            .startTime(request.startTime())
            .endTime(request.endTime())
            .purpose(request.purpose().trim())
            .expectedAttendees(request.expectedAttendees())
            .status(BookingStatus.PENDING)
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();

        return toResponse(bookingRepository.save(booking));
    }

    public List<BookingResponse> getMyBookings(String requesterId, BookingStatus status) {
        List<Booking> bookings = status == null
            ? bookingRepository.findByRequesterIdOrderByBookingDateDescStartTimeAsc(requesterId)
            : bookingRepository.findByRequesterIdAndStatusOrderByBookingDateDescStartTimeAsc(requesterId, status);

        return bookings.stream().map(this::toResponse).toList();
    }

    public BookingResponse getMyBookingById(String requesterId, String bookingId) {
        Booking booking = bookingRepository.findByIdAndRequesterId(bookingId, requesterId)
            .orElseThrow(() -> new BookingNotFoundException("Booking not found"));

        return toResponse(booking);
    }

    public BookingResponse cancelMyBooking(String requesterId, String bookingId) {
        Booking booking = bookingRepository.findByIdAndRequesterId(bookingId, requesterId)
            .orElseThrow(() -> new BookingNotFoundException("Booking not found"));

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new InvalidBookingStateException("Only approved bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason("Cancelled by requester");
        booking.setCancelledAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());

        return toResponse(bookingRepository.save(booking));
    }

    private void ensureNoConflict(String resourceId, LocalDate bookingDate, LocalTime startTime, LocalTime endTime) {
        boolean conflictExists = bookingRepository.existsByResourceIdAndBookingDateAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
            resourceId.trim(),
            bookingDate,
            ACTIVE_BOOKING_STATUSES,
            endTime,
            startTime
        );

        if (conflictExists) {
            throw new BookingConflictException("The selected resource is already booked for the chosen time range");
        }
    }

    private void validateTimeRange(LocalTime startTime, LocalTime endTime) {
        if (!startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("Start time must be before end time");
        }
    }

    private void validateSameDayNotInPast(LocalDate bookingDate, LocalTime startTime) {
        if (bookingDate.equals(LocalDate.now()) && !startTime.isAfter(LocalTime.now())) {
            throw new IllegalArgumentException("Start time must be in the future for today's booking");
        }
    }

    private String normalizeOptional(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private BookingResponse toResponse(Booking booking) {
        return new BookingResponse(
            booking.getId(),
            booking.getRequesterId(),
            booking.getRequesterName(),
            booking.getResourceId(),
            booking.getResourceName(),
            booking.getBookingDate(),
            booking.getStartTime(),
            booking.getEndTime(),
            booking.getPurpose(),
            booking.getExpectedAttendees(),
            booking.getStatus(),
            booking.getDecisionReason(),
            booking.getCancellationReason(),
            booking.getCreatedAt(),
            booking.getUpdatedAt()
        );
    }
}