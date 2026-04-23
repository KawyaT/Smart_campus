package com.smartcampus.repository.booking;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.smartcampus.model.booking.Booking;
import com.smartcampus.model.booking.BookingStatus;

public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findAllByOrderByBookingDateDescStartTimeAsc();

    List<Booking> findByStatusOrderByBookingDateDescStartTimeAsc(BookingStatus status);

    List<Booking> findByRequesterIdOrderByBookingDateDescStartTimeAsc(String requesterId);

    List<Booking> findByRequesterIdAndStatusOrderByBookingDateDescStartTimeAsc(String requesterId, BookingStatus status);

    Optional<Booking> findByIdAndRequesterId(String id, String requesterId);

    Optional<Booking> findByQrToken(String qrToken);

    boolean existsByResourceIdAndBookingDateAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
        String resourceId,
        LocalDate bookingDate,
        Collection<BookingStatus> statuses,
        LocalTime endTime,
        LocalTime startTime
    );

    boolean existsByResourceIdAndBookingDateAndStatusInAndStartTimeLessThanAndEndTimeGreaterThanAndIdNot(
        String resourceId,
        LocalDate bookingDate,
        Collection<BookingStatus> statuses,
        LocalTime endTime,
        LocalTime startTime,
        String id
    );
}
