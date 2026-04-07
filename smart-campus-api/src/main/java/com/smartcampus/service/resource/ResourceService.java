package com.smartcampus.service.resource;

import com.smartcampus.dto.request.resource.ResourceRequest;
import com.smartcampus.dto.responce.resource.ResourceResponse;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.resource.Resource;
import com.smartcampus.model.resource.ResourceStatus;
import com.smartcampus.model.resource.ResourceType;
import com.smartcampus.repository.resource.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceResponse createResource(ResourceRequest request) {
        Resource resource = Resource.builder()
            .name(request.getName())
            .type(request.getType())
            .capacity(request.getCapacity())
            .location(request.getLocation())
            .description(request.getDescription())
            .status(request.getStatus() != null ? request.getStatus() : ResourceStatus.ACTIVE)
            .availabilityWindows(request.getAvailabilityWindows())
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();

        return mapToResponse(resourceRepository.save(resource));
    }

    public List<ResourceResponse> getAllResources() {
        return resourceRepository.findAll().stream()
            .map(this::mapToResponse)
            .toList();
    }

    public ResourceResponse getResourceById(String id) {
        Resource resource = resourceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + id));
        return mapToResponse(resource);
    }

    public ResourceResponse updateResource(String id, ResourceRequest request) {
        Resource resource = resourceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + id));

        resource.setName(request.getName());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());
        resource.setDescription(request.getDescription());
        resource.setStatus(request.getStatus());
        resource.setAvailabilityWindows(request.getAvailabilityWindows());
        resource.setUpdatedAt(LocalDateTime.now());

        return mapToResponse(resourceRepository.save(resource));
    }

    public void deleteResource(String id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Resource not found: " + id);
        }
        resourceRepository.deleteById(id);
    }

    public List<ResourceResponse> searchResources(
        ResourceType type,
        Integer minCapacity,
        String location,
        ResourceStatus status
    ) {
        return resourceRepository.findAll().stream()
            .filter(r -> type == null || r.getType() == type)
            .filter(r -> minCapacity == null || (r.getCapacity() != null && r.getCapacity() >= minCapacity))
            .filter(r -> location == null || (r.getLocation() != null && r.getLocation().toLowerCase().contains(location.toLowerCase())))
            .filter(r -> status == null || r.getStatus() == status)
            .map(this::mapToResponse)
            .toList();
    }

    private ResourceResponse mapToResponse(Resource r) {
        return ResourceResponse.builder()
            .id(r.getId())
            .name(r.getName())
            .type(r.getType())
            .capacity(r.getCapacity())
            .location(r.getLocation())
            .description(r.getDescription())
            .status(r.getStatus())
            .availabilityWindows(r.getAvailabilityWindows())
            .createdAt(r.getCreatedAt())
            .build();
    }
}

