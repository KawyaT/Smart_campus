package com.smartcampus.controller.resource;

import com.smartcampus.dto.request.resource.ResourceRequest;
import com.smartcampus.dto.responce.resource.ResourceResponse;
import com.smartcampus.model.resource.ResourceStatus;
import com.smartcampus.model.resource.ResourceType;
import com.smartcampus.service.resource.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    // GET all resources (USER + ADMIN)
    @GetMapping
    public ResponseEntity<List<ResourceResponse>> getAllResources() {
        return ResponseEntity.ok(resourceService.getAllResources());
    }

    // GET single resource by ID
    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponse> getResourceById(@PathVariable String id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    // GET search & filter
    @GetMapping("/search")
    public ResponseEntity<List<ResourceResponse>> searchResources(
        @RequestParam(required = false) ResourceType type,
        @RequestParam(required = false) Integer minCapacity,
        @RequestParam(required = false) String location,
        @RequestParam(required = false) ResourceStatus status
    ) {
        return ResponseEntity.ok(resourceService.searchResources(type, minCapacity, location, status));
    }

    // POST create resource (ADMIN only)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceResponse> createResource(@Valid @RequestBody ResourceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resourceService.createResource(request));
    }

    // PUT update resource (ADMIN only)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceResponse> updateResource(
        @PathVariable String id,
        @Valid @RequestBody ResourceRequest request
    ) {
        return ResponseEntity.ok(resourceService.updateResource(id, request));
    }

    // DELETE resource (ADMIN only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteResource(@PathVariable String id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}

