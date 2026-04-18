package com.smartcampus.model.resource;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityWindow {

    @NotNull(message = "Day is required in availability window")
    private DayOfWeek day;

    @NotNull(message = "Open time is required")
    private LocalTime openTime;

    @NotNull(message = "Close time is required")
    private LocalTime closeTime;
}

