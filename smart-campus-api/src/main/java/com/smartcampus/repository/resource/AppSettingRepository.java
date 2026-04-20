package com.smartcampus.repository.resource;

import com.smartcampus.model.resource.AppSetting;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppSettingRepository extends MongoRepository<AppSetting, String> {
    Optional<AppSetting> findBySettingKey(String settingKey);

    List<AppSetting> findByCategory(String category);
}
