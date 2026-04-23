package com.smartcampus.repository;

import com.smartcampus.model.BroadcastBatch;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BroadcastBatchRepository extends MongoRepository<BroadcastBatch, String> {

    List<BroadcastBatch> findAllByOrderByCreatedAtDesc();
}
