package com.smartcampus.controller.resource;

<<<<<<< feature/bookings
import com.smartcampus.dto.request.resource.ResourceRequest;
import com.smartcampus.dto.response.resource.ResourceResponse;
=======
import com.smartcampus.dto.request.ResourceRequest;
import com.smartcampus.dto.responce.resource.ResourceResponse;
>>>>>>> dev
import com.smartcampus.model.resource.ResourceStatus;
import com.smartcampus.model.resource.ResourceType;
import com.smartcampus.service.resource.ResourceService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Validated
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping
    public ResponseEntity<List<ResourceResponse>> getAllResources() {
        return ResponseEntity.ok(resourceService.getAllResources());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponse> getResourceById(
            @PathVariable @Size(min = 1, message = "ID cannot be empty") String id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ResourceResponse>> searchResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) ResourceStatus status,
            @RequestParam(required = false)
            @Min(value = 1, message = "Minimum capacity must be at least 1")
            @Max(value = 5000, message = "Minimum capacity cannot exceed 5000")
            Integer minCapacity,
            @RequestParam(required = false)
            @Size(max = 100, message = "Location search cannot exceed 100 characters")
            String location
    ) {
        return ResponseEntity.ok(resourceService.searchResources(type, status, minCapacity, location));
    }

    @PostMapping
    public ResponseEntity<ResourceResponse> createResource(
            @Valid @RequestBody ResourceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(resourceService.createResource(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResourceResponse> updateResource(
            @PathVariable String id,
            @Valid @RequestBody ResourceRequest request
    ) {
        return ResponseEntity.ok(resourceService.updateResource(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable String id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}

