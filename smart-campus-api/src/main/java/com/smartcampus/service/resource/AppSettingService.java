package com.smartcampus.service.resource;

import com.smartcampus.model.resource.AppSetting;
import com.smartcampus.repository.resource.AppSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AppSettingService {

    @Autowired
    private AppSettingRepository appSettingRepository;

    public List<AppSetting> getAllSettings() {
        List<AppSetting> settings = appSettingRepository.findAll();
        if (settings.isEmpty()) {
            seedDefaults();
            settings = appSettingRepository.findAll();
        }
        return settings;
    }

    public List<AppSetting> getSettingsByCategory(String category) {
        return appSettingRepository.findByCategory(category);
    }

    public AppSetting upsertSetting(String key, AppSetting request) {
        AppSetting existing = appSettingRepository.findBySettingKey(key).orElse(new AppSetting());
        existing.setSettingKey(key);
        existing.setSettingValue(request.getSettingValue());
        existing.setCategory(request.getCategory());
        existing.setDescription(request.getDescription());
        existing.setUpdatedBy(request.getUpdatedBy() != null ? request.getUpdatedBy() : "system");
        existing.setUpdatedAt(LocalDateTime.now());
        return appSettingRepository.save(existing);
    }

    public void deleteSetting(String id) {
        appSettingRepository.deleteById(id);
    }

    private void seedDefaults() {
        appSettingRepository.save(createDefault(
                "maintenance.autoAssign",
                "true",
                "ticketing",
                "Automatically assign maintenance tickets"
        ));
        appSettingRepository.save(createDefault(
                "booking.maxHours",
                "4",
                "booking",
                "Maximum allowed booking duration in hours"
        ));
        appSettingRepository.save(createDefault(
                "notifications.emailEnabled",
                "true",
                "notifications",
                "Enable email notifications"
        ));
    }

    private AppSetting createDefault(String key, String value, String category, String description) {
        AppSetting setting = new AppSetting();
        setting.setSettingKey(key);
        setting.setSettingValue(value);
        setting.setCategory(category);
        setting.setDescription(description);
        setting.setUpdatedBy("system");
        setting.setUpdatedAt(LocalDateTime.now());
        return setting;
    }
}
