package com.smartcampus.controller.resource;

import com.smartcampus.model.resource.AppSetting;
import com.smartcampus.service.resource.AppSettingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "*")
public class AppSettingController {

    @Autowired
    private AppSettingService appSettingService;

    @GetMapping
    public ResponseEntity<List<AppSetting>> getAllSettings() {
        return ResponseEntity.ok(appSettingService.getAllSettings());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<AppSetting>> getSettingsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(appSettingService.getSettingsByCategory(category));
    }

    @PutMapping("/{key}")
    public ResponseEntity<AppSetting> upsertSetting(@PathVariable String key, @RequestBody AppSetting setting) {
        return ResponseEntity.ok(appSettingService.upsertSetting(key, setting));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteSetting(@PathVariable String id) {
        appSettingService.deleteSetting(id);
        return ResponseEntity.ok(Map.of("message", "Setting deleted successfully"));
    }
}
