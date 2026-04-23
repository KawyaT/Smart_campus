package com.smartcampus.config;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.smartcampus.model.resource.Resource;
import com.smartcampus.model.resource.ResourceStatus;
import com.smartcampus.model.resource.ResourceType;
import com.smartcampus.repository.resource.ResourceRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final ResourceRepository resourceRepository;

    @Override
    public void run(String... args) throws Exception {
        if (resourceRepository.count() == 0) {
            // Seed sample resources
            LocalDateTime now = LocalDateTime.now();
            
            Resource[] resources = {
                new Resource(
                    null,
                    "Conference Room A",
                    ResourceType.MEETING_ROOM,
                    20,
                    "Building A, Floor 2",
                    "Large conference room with video conferencing equipment",
                    ResourceStatus.ACTIVE,
                    Collections.emptyList(),
                    now,
                    now
                ),
                new Resource(
                    null,
                    "Library Study Area",
                    ResourceType.LECTURE_HALL,
                    50,
                    "Central Library, Level 3",
                    "Quiet study area with individual desks",
                    ResourceStatus.ACTIVE,
                    Collections.emptyList(),
                    now,
                    now
                ),
                new Resource(
                    null,
                    "Auditorium",
                    ResourceType.LECTURE_HALL,
                    200,
                    "Student Center, Main Hall",
                    "Large auditorium for seminars and presentations",
                    ResourceStatus.ACTIVE,
                    Collections.emptyList(),
                    now,
                    now
                ),
                new Resource(
                    null,
                    "Lab Room 101",
                    ResourceType.LAB,
                    30,
                    "Science Building, Room 101",
                    "Computer lab with 30 workstations",
                    ResourceStatus.ACTIVE,
                    Collections.emptyList(),
                    now,
                    now
                ),
                new Resource(
                    null,
                    "Sports Facility",
                    ResourceType.EQUIPMENT,
                    100,
                    "Athletic Center",
                    "Multi-purpose sports court",
                    ResourceStatus.ACTIVE,
                    Collections.emptyList(),
                    now,
                    now
                )
            };

            resourceRepository.saveAll(Arrays.asList(resources));
            System.out.println("✓ Initialized 5 sample resources");
        }
    }
}
