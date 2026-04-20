package com.smartcampus.model.resource;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "resources")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Resource {

    @Id
    private String id;

    @NotBlank
    private String name;

    private ResourceType type;        // LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT
    private Integer capacity;
    private String location;
    private String description;
    private ResourceStatus status;    // ACTIVE, OUT_OF_SERVICE
    private List<AvailabilityWindow> availabilityWindows;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
