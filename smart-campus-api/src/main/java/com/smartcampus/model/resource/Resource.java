package com.smartcampus.model.resource;

<<<<<<< feature/bookings
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

=======
import jakarta.validation.constraints.NotBlank;
>>>>>>> dev
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
<<<<<<< feature/bookings

=======
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "resources")
>>>>>>> dev
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
<<<<<<< feature/bookings
@Document("resources")
=======
>>>>>>> dev
public class Resource {

    @Id
    private String id;

<<<<<<< feature/bookings
    @Indexed(unique = true)
    private String name;

    private ResourceType type;

    private Integer capacity;

    private String location;

    private String description;

    private ResourceStatus status;

    private List<AvailabilityWindow> availabilityWindows;

    private LocalDateTime createdAt;

=======
    @NotBlank
    private String name;

    private ResourceType type;        // LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT
    private Integer capacity;
    private String location;
    private String description;
    private ResourceStatus status;    // ACTIVE, OUT_OF_SERVICE
    private List<AvailabilityWindow> availabilityWindows;
    private LocalDateTime createdAt;
>>>>>>> dev
    private LocalDateTime updatedAt;
}
