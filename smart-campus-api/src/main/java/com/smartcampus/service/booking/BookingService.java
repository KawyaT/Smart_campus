package com.smartcampus.service.booking;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.smartcampus.dto.request.booking.BookingCreateRequest;
import com.smartcampus.dto.request.booking.BookingUpdateRequest;
import com.smartcampus.dto.response.booking.BookingAnalyticsResponse;
import com.smartcampus.dto.response.booking.BookingQrResponse;
import com.smartcampus.dto.response.booking.BookingResponse;
import com.smartcampus.dto.response.booking.BookingUsageCount;
import com.smartcampus.dto.response.booking.CheckInVerificationResponse;
import com.smartcampus.model.booking.Booking;
import com.smartcampus.model.booking.BookingStatus;
import com.smartcampus.model.resource.Resource;
import com.smartcampus.repository.booking.BookingRepository;
import com.smartcampus.repository.resource.ResourceRepository;
import com.smartcampus.service.NotificationService;
import com.smartcampus.util.QrCodeUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private static final EnumSet<BookingStatus> ACTIVE_BOOKING_STATUSES = EnumSet.of(
        BookingStatus.PENDING,
        BookingStatus.APPROVED
    );

    private static final int TOP_RESOURCE_LIMIT = 5;
    private static final int TOP_HOUR_LIMIT = 6;
    private static final LocalTime BOOKING_WINDOW_START = LocalTime.of(8, 30);
    private static final LocalTime BOOKING_WINDOW_END = LocalTime.of(17, 0);
    private static final int QR_SIZE = 320;

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;
    private final QrCodeUtil qrCodeUtil;
    private final BookingQrMailService bookingQrMailService;

    @Value("${app.checkin.base-url:http://localhost:8080}")
    private String checkInBaseUrl;

    public BookingResponse createBooking(BookingCreateRequest request, String requesterId, String requesterName) {
        validateTimeRange(request.startTime(), request.endTime());
        validateSameDayNotInPast(request.bookingDate(), request.startTime());
        validateResourceCapacity(request.resourceId(), request.expectedAttendees());
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
            .qrGenerated(false)
            .qrUsed(false)
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();

        Booking saved = bookingRepository.save(booking);
        String resourceLabel = bookingResourceLabel(saved);
        notifyBooking(
            requesterId,
            "Your booking for " + resourceLabel + " was submitted and is pending approval."
        );
        return toResponse(saved);
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

        Booking saved = bookingRepository.save(booking);
        notifyBooking(requesterId, "Your booking for " + bookingResourceLabel(saved) + " was cancelled.");
        return toResponse(saved);
    }

    public BookingResponse updateMyBooking(String requesterId, String bookingId, BookingUpdateRequest request) {
        Booking booking = bookingRepository.findByIdAndRequesterId(bookingId, requesterId)
            .orElseThrow(() -> new BookingNotFoundException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidBookingStateException("Only pending bookings can be updated");
        }

        validateTimeRange(request.startTime(), request.endTime());
        validateSameDayNotInPast(request.bookingDate(), request.startTime());
        validateResourceCapacity(request.resourceId(), request.expectedAttendees());
        ensureNoConflictForUpdate(
            booking.getId(),
            request.resourceId(),
            request.bookingDate(),
            request.startTime(),
            request.endTime()
        );

        booking.setResourceId(request.resourceId().trim());
        booking.setResourceName(normalizeOptional(request.resourceName()));
        booking.setBookingDate(request.bookingDate());
        booking.setStartTime(request.startTime());
        booking.setEndTime(request.endTime());
        booking.setPurpose(request.purpose().trim());
        booking.setExpectedAttendees(request.expectedAttendees());
        booking.setUpdatedAt(LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);
        notifyBooking(requesterId, "Your booking for " + bookingResourceLabel(saved) + " was updated.");
        return toResponse(saved);
    }

    public List<BookingResponse> getAllBookings(BookingStatus status, String requesterId) {
        Stream<Booking> stream;

        if (status != null && StringUtils.hasText(requesterId)) {
            stream = bookingRepository.findByRequesterIdAndStatusOrderByBookingDateDescStartTimeAsc(requesterId.trim(), status).stream();
        } else if (status != null) {
            stream = bookingRepository.findByStatusOrderByBookingDateDescStartTimeAsc(status).stream();
        } else if (StringUtils.hasText(requesterId)) {
            stream = bookingRepository.findByRequesterIdOrderByBookingDateDescStartTimeAsc(requesterId.trim()).stream();
        } else {
            stream = bookingRepository.findAllByOrderByBookingDateDescStartTimeAsc().stream();
        }

        return stream.map(this::toResponse).toList();
    }

    public BookingAnalyticsResponse getAdminAnalytics() {
        List<Booking> trackedBookings = bookingRepository.findAll().stream()
            .filter(booking -> ACTIVE_BOOKING_STATUSES.contains(booking.getStatus()))
            .toList();

        List<BookingUsageCount> topResources = trackedBookings.stream()
            .collect(Collectors.groupingBy(
                booking -> normalizeResourceLabel(booking.getResourceName(), booking.getResourceId()),
                Collectors.counting()
            ))
            .entrySet()
            .stream()
            .sorted(byCountDescThenLabel())
            .limit(TOP_RESOURCE_LIMIT)
            .map(entry -> new BookingUsageCount(entry.getKey(), entry.getValue()))
            .toList();

        Map<String, Long> hourlyCounts = trackedBookings.stream()
            .collect(Collectors.groupingBy(
                booking -> formatHourSlot(booking.getStartTime()),
                LinkedHashMap::new,
                Collectors.counting()
            ));

        List<BookingUsageCount> peakBookingHours = hourlyCounts.entrySet()
            .stream()
            .sorted(byCountDescThenLabel())
            .limit(TOP_HOUR_LIMIT)
            .map(entry -> new BookingUsageCount(entry.getKey(), entry.getValue()))
            .toList();

        return new BookingAnalyticsResponse(trackedBookings.size(), topResources, peakBookingHours);
    }

    public BookingResponse reviewBooking(
        String bookingId,
        BookingStatus decision,
        String reason,
        String reviewerId,
        String reviewerName
    ) {
        if (decision != BookingStatus.APPROVED && decision != BookingStatus.REJECTED) {
            throw new IllegalArgumentException("Decision must be APPROVED or REJECTED");
        }

        if (decision == BookingStatus.REJECTED && !StringUtils.hasText(reason)) {
            throw new IllegalArgumentException("Reason is required when rejecting a booking");
        }

        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new BookingNotFoundException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidBookingStateException("Only pending bookings can be reviewed");
        }

        booking.setStatus(decision);
        booking.setDecisionReason(normalizeOptional(reason));
        booking.setReviewedById(reviewerId.trim());
        booking.setReviewedByName(normalizeOptional(reviewerName));
        booking.setReviewedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());

        if (decision == BookingStatus.APPROVED) {
            if (!StringUtils.hasText(booking.getQrToken())) {
                booking.setQrToken(UUID.randomUUID().toString());
            }
            booking.setQrGenerated(true);
        }

        Booking saved = bookingRepository.save(booking);
        String resourceLabel = bookingResourceLabel(saved);
        if (decision == BookingStatus.APPROVED) {
            notifyBooking(
                saved.getRequesterId(),
                "Your booking for " + resourceLabel + " was approved."
            );
            bookingQrMailService.sendApprovedBookingQrMail(saved, buildCheckInUrl(saved.getQrToken()));
        } else {
            String suffix = StringUtils.hasText(reason) ? " Reason: " + reason.trim() : "";
            notifyBooking(
                saved.getRequesterId(),
                "Your booking for " + resourceLabel + " was rejected." + suffix
            );
        }
        return toResponse(saved);
    }

    public BookingQrResponse generateQrCode(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new BookingNotFoundException("Booking not found"));

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new InvalidBookingStateException("QR code can only be generated for approved bookings");
        }

        if (!StringUtils.hasText(booking.getQrToken())) {
            booking.setQrToken(UUID.randomUUID().toString());
        }

        booking.setQrGenerated(true);
        booking.setUpdatedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);

        String verifyUrl = buildCheckInUrl(saved.getQrToken());
        String qrImageBase64 = qrCodeUtil.generateBase64Png(verifyUrl, QR_SIZE, QR_SIZE);

        return new BookingQrResponse(
            saved.getId(),
            saved.getQrToken(),
            qrImageBase64,
            saved.isQrGenerated(),
            saved.isQrUsed()
        );
    }

    public BookingQrResponse getExistingQrCode(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new BookingNotFoundException("Booking not found"));

        if (!booking.isQrGenerated() || !StringUtils.hasText(booking.getQrToken())) {
            throw new InvalidBookingStateException("QR code has not been generated for this booking");
        }

        String verifyUrl = buildCheckInUrl(booking.getQrToken());
        String qrImageBase64 = qrCodeUtil.generateBase64Png(verifyUrl, QR_SIZE, QR_SIZE);

        return new BookingQrResponse(
            booking.getId(),
            booking.getQrToken(),
            qrImageBase64,
            booking.isQrGenerated(),
            booking.isQrUsed()
        );
    }

    public CheckInVerificationResponse verifyCheckIn(String token) {
        if (!StringUtils.hasText(token)) {
            throw new IllegalArgumentException("Token is required");
        }

        Booking booking = bookingRepository.findByQrToken(token.trim())
            .orElseThrow(() -> new BookingNotFoundException("Invalid QR token"));

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new InvalidBookingStateException("Booking is not approved for check-in");
        }

        if (booking.isQrUsed()) {
            throw new InvalidBookingStateException("This QR code has already been used");
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = LocalDateTime.of(booking.getBookingDate(), booking.getStartTime());
        LocalDateTime end = LocalDateTime.of(booking.getBookingDate(), booking.getEndTime());

        if (now.isBefore(start) || now.isAfter(end)) {
            throw new InvalidBookingStateException("Check-in is only valid during the booking time range");
        }

        booking.setQrUsed(true);
        booking.setUpdatedAt(now);
        Booking saved = bookingRepository.save(booking);

        return new CheckInVerificationResponse(
            true,
            "Check-in successful",
            saved.getId(),
            saved.getResourceId(),
            now
        );
    }

    private String buildCheckInUrl(String token) {
        String base = checkInBaseUrl.endsWith("/")
            ? checkInBaseUrl.substring(0, checkInBaseUrl.length() - 1)
            : checkInBaseUrl;
        return base + "/api/checkin/verify?token=" + token;
    }

    private void notifyBooking(String userId, String message) {
        if (!StringUtils.hasText(userId)) {
            return;
        }
        try {
            notificationService.createNotification(userId.trim(), message, "BOOKING");
        } catch (Exception ex) {
            log.warn("Could not create booking notification for user {}: {}", userId, ex.getMessage());
        }
    }

    private String bookingResourceLabel(Booking booking) {
        if (StringUtils.hasText(booking.getResourceName())) {
            return booking.getResourceName().trim();
        }
        if (StringUtils.hasText(booking.getResourceId())) {
            return booking.getResourceId().trim();
        }
        return "your resource";
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

    private void ensureNoConflictForUpdate(
        String bookingId,
        String resourceId,
        LocalDate bookingDate,
        LocalTime startTime,
        LocalTime endTime
    ) {
        boolean conflictExists = bookingRepository
            .existsByResourceIdAndBookingDateAndStatusInAndStartTimeLessThanAndEndTimeGreaterThanAndIdNot(
                resourceId.trim(),
                bookingDate,
                ACTIVE_BOOKING_STATUSES,
                endTime,
                startTime,
                bookingId
            );

        if (conflictExists) {
            throw new BookingConflictException("The selected resource is already booked for the chosen time range");
        }
    }

    private void validateTimeRange(LocalTime startTime, LocalTime endTime) {
        if (!startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        if (startTime.isBefore(BOOKING_WINDOW_START) || endTime.isAfter(BOOKING_WINDOW_END)) {
            throw new IllegalArgumentException("Booking time must be between 08:30 and 17:00");
        }
    }

    private void validateSameDayNotInPast(LocalDate bookingDate, LocalTime startTime) {
        if (bookingDate.equals(LocalDate.now()) && !startTime.isAfter(LocalTime.now())) {
            throw new IllegalArgumentException("Start time must be in the future for today's booking");
        }
    }

    private void validateResourceCapacity(String resourceId, Integer expectedAttendees) {
        if (expectedAttendees == null) {
            return;
        }

        Resource resource = resourceRepository.findById(resourceId.trim())
            .orElseThrow(() -> new IllegalArgumentException("Selected resource not found"));

        Integer capacity = resource.getCapacity();
        if (capacity != null && expectedAttendees > capacity) {
            throw new IllegalArgumentException(
                "Expected attendees exceed resource capacity. Capacity is " + capacity
            );
        }
    }

    private String normalizeOptional(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private String normalizeResourceLabel(String resourceName, String resourceId) {
        if (StringUtils.hasText(resourceName)) {
            return resourceName.trim();
        }
        if (StringUtils.hasText(resourceId)) {
            return resourceId.trim();
        }
        return "Unknown Resource";
    }

    private String formatHourSlot(LocalTime startTime) {
        if (startTime == null) {
            return "Unknown Hour";
        }
        int hour = startTime.getHour();
        return String.format("%02d:00-%02d:00", hour, (hour + 1) % 24);
    }

    private Comparator<Map.Entry<String, Long>> byCountDescThenLabel() {
        return Comparator
            .comparing((Function<Map.Entry<String, Long>, Long>) Map.Entry::getValue)
            .reversed()
            .thenComparing(Map.Entry::getKey);
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
            booking.isQrGenerated(),
            booking.isQrUsed(),
            booking.getDecisionReason(),
            booking.getCancellationReason(),
            booking.getCreatedAt(),
            booking.getUpdatedAt()
        );
    }
}
