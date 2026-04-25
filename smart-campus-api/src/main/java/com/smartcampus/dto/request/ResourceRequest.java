package com.smartcampus.dto.request;

import com.smartcampus.model.resource.AvailabilityWindow;
import com.smartcampus.model.resource.ResourceStatus;
import com.smartcampus.model.resource.ResourceType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

@Data
public class ResourceRequest {
// Validation annotations ensure that incoming data is correct and complete
    @NotBlank(message = "Resource name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @NotNull(message = "Resource type is required")
    private ResourceType type;

    @Min(value = 1, message = "Capacity must be at least 1")
    @Max(value = 5000, message = "Capacity cannot exceed 5000")
    private Integer capacity;

    @NotBlank(message = "Location is required")
    @Size(min = 2, max = 150, message = "Location must be between 2 and 150 characters")
    private String location;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    private ResourceStatus status;

    @Valid
    private List<AvailabilityWindow> availabilityWindows;
}
