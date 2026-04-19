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

import com.smartcampus.dto.request.booking.BookingCreateRequest;
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

   

    @PatchMapping("/my/{bookingId}/cancel")
    public ResponseEntity<BookingResponse> cancelMyBooking(
        @RequestHeader("X-User-Id") @NotBlank String requesterId,
        @PathVariable String bookingId
    ) {
        return ResponseEntity.ok(bookingService.cancelMyBooking(requesterId, bookingId));
    }
}