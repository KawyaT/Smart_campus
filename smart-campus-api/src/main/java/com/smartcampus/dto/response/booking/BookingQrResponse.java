package com.smartcampus.dto.response.booking;

public record BookingQrResponse(
    String bookingId,
    String qrToken,
    String qrImageBase64,
    boolean qrGenerated,
    boolean qrUsed
) {
}
