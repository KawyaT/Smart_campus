package com.smartcampus.repository.booking;

import com.smartcampus.model.booking.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByStatus(Booking.BookingStatus status);

    List<Booking> findByFacilityId(String facilityId);

    List<Booking> findByBookedByContainingIgnoreCase(String bookedBy);
}
