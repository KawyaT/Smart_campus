package com.smartcampus.model.resource;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppSetting {

    @Id
    private String id;

    private String settingKey;
    private String settingValue;
    private String category;
    private String description;
    private String updatedBy;
    private LocalDateTime updatedAt;
}
