package com.smartcampus.repository.resource;

import com.smartcampus.model.resource.Resource;
import com.smartcampus.model.resource.ResourceStatus;
import com.smartcampus.model.resource.ResourceType;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ResourceRepository extends MongoRepository<Resource, String> {

    List<Resource> findByType(ResourceType type);
    List<Resource> findByStatus(ResourceStatus status);
    List<Resource> findByLocationContainingIgnoreCase(String location);

    // For search + filter combined
    List<Resource> findByTypeAndStatusAndCapacityGreaterThanEqual(
        ResourceType type, ResourceStatus status, int capacity
    );
}

