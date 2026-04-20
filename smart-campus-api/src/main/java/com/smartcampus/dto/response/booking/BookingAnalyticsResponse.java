package com.smartcampus.dto.response.booking;

import java.util.List;

public record BookingAnalyticsResponse(
    long totalTrackedBookings,
    List<BookingUsageCount> topResources,
    List<BookingUsageCount> peakBookingHours
) {
}
