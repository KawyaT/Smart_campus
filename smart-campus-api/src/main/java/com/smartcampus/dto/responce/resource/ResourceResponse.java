package com.smartcampus.dto.responce.resource;

import com.smartcampus.model.resource.AvailabilityWindow;
import com.smartcampus.model.resource.ResourceStatus;
import com.smartcampus.model.resource.ResourceType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ResourceResponse {
    private String id;
    private String name;
    private ResourceType type;
    private Integer capacity;
    private String location;
    private String description;
    private ResourceStatus status;
    private List<AvailabilityWindow> availabilityWindows;
    private LocalDateTime createdAt;
}

