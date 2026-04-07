package com.smartcampus.model.resource;

import lombok.Data;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Data
public class AvailabilityWindow {
    private DayOfWeek day;       // MONDAY, TUESDAY...
    private LocalTime openTime;  // e.g. 08:00
    private LocalTime closeTime; // e.g. 18:00
}

