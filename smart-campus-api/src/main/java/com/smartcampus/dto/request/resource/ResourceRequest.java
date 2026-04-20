package com.smartcampus.dto.request.resource;

import com.smartcampus.model.resource.AvailabilityWindow;
import com.smartcampus.model.resource.ResourceStatus;
import com.smartcampus.model.resource.ResourceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class ResourceRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotNull
    private ResourceType type;

    private Integer capacity;
    private String location;
    private String description;
    private ResourceStatus status;
    private List<AvailabilityWindow> availabilityWindows;
}

