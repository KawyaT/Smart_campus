package com.smartcampus.model.resource;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("resources")
public class Resource {

    @Id
    private String id;

    @Indexed(unique = true)
    private String name;

    private ResourceType type;

    private Integer capacity;

    private String location;

    private String description;

    private ResourceStatus status;

    private List<AvailabilityWindow> availabilityWindows;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
