package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * One row per admin campus-wide SYSTEM broadcast for history & bulk delete.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "broadcast_batches")
public class BroadcastBatch {

    @Id
    private String id;

    private String message;

    private LocalDateTime createdAt;

    private int recipientCount;
}
