package com.smartcampus.dto.request;

import com.smartcampus.model.resource.ResourceStatus;
import com.smartcampus.model.resource.ResourceType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResourceSearchRequest {

    private ResourceType type;

    private ResourceStatus status;

    @Min(value = 1, message = "Minimum capacity must be at least 1")
    @Max(value = 5000, message = "Minimum capacity cannot exceed 5000")
    private Integer minCapacity;

    @Size(max = 100, message = "Location search term cannot exceed 100 characters")
    private String location;

    @Size(max = 100, message = "Search term cannot exceed 100 characters")
    private String search;
}
