package com.smartcampus.repository;

import com.smartcampus.model.Notification;
import com.smartcampus.model.NotificationType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Notification> findByUserIdAndTypeOrderByCreatedAtDesc(String userId, NotificationType type);

    long countByUserIdAndRead(String userId, boolean read);

    void deleteAllByBroadcastBatchId(String broadcastBatchId);
}
