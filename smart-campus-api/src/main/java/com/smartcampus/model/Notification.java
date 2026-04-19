package com.smartcampus.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String message;

    private NotificationType type;

    @Field("isRead")
    @JsonProperty("isRead")
    private boolean read;

    private LocalDateTime createdAt;
}
