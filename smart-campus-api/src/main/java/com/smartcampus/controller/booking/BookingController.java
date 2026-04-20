package com.smartcampus.controller.booking;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.dto.request.booking.BookingDecisionRequest;
import com.smartcampus.dto.request.booking.BookingCreateRequest;
import com.smartcampus.dto.request.booking.BookingUpdateRequest;
import com.smartcampus.dto.response.booking.BookingAnalyticsResponse;
import com.smartcampus.dto.response.booking.BookingResponse;
import com.smartcampus.model.booking.BookingStatus;
import com.smartcampus.service.booking.BookingService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/bookings")
@Validated
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
        @Valid @RequestBody BookingCreateRequest request,
        @RequestHeader("X-User-Id") @NotBlank String requesterId,
        @RequestHeader(value = "X-User-Name", required = false) String requesterName
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(bookingService.createBooking(request, requesterId, requesterName));
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
        @RequestHeader("X-User-Id") @NotBlank String requesterId,
        @RequestParam(required = false) BookingStatus status
    ) {
        return ResponseEntity.ok(bookingService.getMyBookings(requesterId, status));
    }

    @GetMapping("/my/{bookingId}")
    public ResponseEntity<BookingResponse> getMyBookingById(
        @RequestHeader("X-User-Id") @NotBlank String requesterId,
        @PathVariable String bookingId
    ) {
        return ResponseEntity.ok(bookingService.getMyBookingById(requesterId, bookingId));
    }

    @PatchMapping("/my/{bookingId}/cancel")
    public ResponseEntity<BookingResponse> cancelMyBooking(
        @RequestHeader("X-User-Id") @NotBlank String requesterId,
        @PathVariable String bookingId
    ) {
        return ResponseEntity.ok(bookingService.cancelMyBooking(requesterId, bookingId));
    }

    @PatchMapping("/my/{bookingId}")
    public ResponseEntity<BookingResponse> updateMyBooking(
        @RequestHeader("X-User-Id") @NotBlank String requesterId,
        @PathVariable String bookingId,
        @Valid @RequestBody BookingUpdateRequest request
    ) {
        return ResponseEntity.ok(bookingService.updateMyBooking(requesterId, bookingId, request));
    }

    @GetMapping("/admin")
    public ResponseEntity<List<BookingResponse>> getAllBookingsForAdmin(
        @RequestParam(required = false) BookingStatus status,
        @RequestParam(required = false) String requesterId
    ) {
        return ResponseEntity.ok(bookingService.getAllBookings(status, requesterId));
    }

    @GetMapping("/admin/analytics")
    public ResponseEntity<BookingAnalyticsResponse> getAdminBookingAnalytics() {
        return ResponseEntity.ok(bookingService.getAdminAnalytics());
    }

    @PatchMapping("/admin/{bookingId}/approve")
    public ResponseEntity<BookingResponse> approveBooking(
        @RequestHeader("X-User-Id") @NotBlank String reviewerId,
        @RequestHeader(value = "X-User-Name", required = false) String reviewerName,
        @PathVariable String bookingId,
        @RequestBody(required = false) BookingDecisionRequest request
    ) {
        String reason = request == null ? null : request.reason();
        return ResponseEntity.ok(bookingService.reviewBooking(
            bookingId,
            BookingStatus.APPROVED,
            reason,
            reviewerId,
            reviewerName
        ));
    }

    @PatchMapping("/admin/{bookingId}/reject")
    public ResponseEntity<BookingResponse> rejectBooking(
        @RequestHeader("X-User-Id") @NotBlank String reviewerId,
        @RequestHeader(value = "X-User-Name", required = false) String reviewerName,
        @PathVariable String bookingId,
        @RequestBody BookingDecisionRequest request
    ) {
        return ResponseEntity.ok(bookingService.reviewBooking(
            bookingId,
            BookingStatus.REJECTED,
            request.reason(),
            reviewerId,
            reviewerName
        ));
    }
}
