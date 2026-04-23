package com.smartcampus.service.booking;

import java.time.format.DateTimeFormatter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.smartcampus.model.User;
import com.smartcampus.model.booking.Booking;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.util.QrCodeUtil;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingQrMailService {

    private static final int QR_SIZE = 320;

    private final JavaMailSender mailSender;
    private final UserRepository userRepository;
    private final QrCodeUtil qrCodeUtil;

    @Value("${app.mail.booking-qr-enabled:false}")
    private boolean bookingQrMailEnabled;

    @Value("${app.mail.from:no-reply@smartcampus.local}")
    private String fromAddress;

    public void sendApprovedBookingQrMail(Booking booking, String checkInUrl) {
        if (!bookingQrMailEnabled) {
            return;
        }

        String recipientEmail = resolveRecipientEmail(booking.getRequesterId());
        if (!StringUtils.hasText(recipientEmail)) {
            log.warn("Skipping booking QR email: no recipient email for requesterId={}", booking.getRequesterId());
            return;
        }

        try {
            byte[] qrPng = qrCodeUtil.generatePngBytes(checkInUrl, QR_SIZE, QR_SIZE);
            String resourceLabel = StringUtils.hasText(booking.getResourceName())
                ? booking.getResourceName().trim()
                : booking.getResourceId();

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom(fromAddress);
            helper.setTo(recipientEmail);
            helper.setSubject("Booking Approved - QR Check-in Pass");

            String html = """
                <p>Hello,</p>
                <p>Your booking has been approved. Your QR check-in pass is attached.</p>
                <ul>
                  <li><strong>Booking ID:</strong> %s</li>
                  <li><strong>Resource:</strong> %s</li>
                  <li><strong>Date:</strong> %s</li>
                  <li><strong>Time:</strong> %s - %s</li>
                </ul>
                <p>You can also verify directly from this link:</p>
                <p><a href=\"%s\">%s</a></p>
                <p>Regards,<br/>Smart Campus Operations Hub</p>
                """.formatted(
                booking.getId(),
                resourceLabel,
                booking.getBookingDate().format(DateTimeFormatter.ISO_LOCAL_DATE),
                booking.getStartTime(),
                booking.getEndTime(),
                checkInUrl,
                checkInUrl
            );

            helper.setText(html, true);
            helper.addAttachment("booking-" + booking.getId() + "-qr.png", () -> new java.io.ByteArrayInputStream(qrPng));
            mailSender.send(message);
        } catch (Exception ex) {
            log.warn("Failed to send booking QR email for booking {}: {}", booking.getId(), ex.getMessage());
        }
    }

    private String resolveRecipientEmail(String requesterId) {
        if (!StringUtils.hasText(requesterId)) {
            return null;
        }

        String value = requesterId.trim();
        if (value.contains("@")) {
            return value;
        }

        return userRepository.findById(value)
            .map(User::getEmail)
            .filter(StringUtils::hasText)
            .map(String::trim)
            .orElse(null);
    }
}
