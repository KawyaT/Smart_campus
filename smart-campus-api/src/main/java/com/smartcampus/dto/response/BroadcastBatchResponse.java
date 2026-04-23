package com.smartcampus.dto.response;

import java.time.LocalDateTime;

public record BroadcastBatchResponse(
        String id,
        String message,
        LocalDateTime createdAt,
        int recipientCount
) {}
