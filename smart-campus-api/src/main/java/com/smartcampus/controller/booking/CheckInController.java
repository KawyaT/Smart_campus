package com.smartcampus.controller.booking;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.dto.response.booking.CheckInVerificationResponse;
import com.smartcampus.service.booking.BookingService;

import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/checkin")
@RequiredArgsConstructor
public class CheckInController {

    private final BookingService bookingService;

    @GetMapping("/verify")
    public ResponseEntity<CheckInVerificationResponse> verifyQr(@RequestParam @NotBlank String token) {
        return ResponseEntity.ok(bookingService.verifyCheckIn(token));
    }
}
