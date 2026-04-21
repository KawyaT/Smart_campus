package com.smartcampus.service;

import com.smartcampus.exception.UserNotFoundException;
import com.smartcampus.model.AuthProvider;
import com.smartcampus.model.Role;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    
    private final UserRepository userRepository;
    
    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("User with email " + user.getEmail() + " already exists");
        }
        if (user.getAuthProvider() == null) {
            user.setAuthProvider(AuthProvider.LOCAL);
        }
        if (user.getPhone() != null) {
            user.setPhone(normalizePhoneOrThrow(user.getPhone()));
        }
        if (user.getAddress() != null) {
            user.setAddress(normalizeAddressOrThrow(user.getAddress()));
        }
        return userRepository.save(user);
    }

    /**
     * Called after Google OAuth: create USER without password, or return existing (LOCAL or GOOGLE) by email.
     */
    public User upsertGoogleUser(String email, String displayName) {
        return userRepository.findByEmail(email)
                .map(existing -> {
                    if (displayName != null && !displayName.isBlank()
                            && (existing.getName() == null || existing.getName().isBlank()
                            || !displayName.equals(existing.getName()))) {
                        existing.setName(displayName);
                        return userRepository.save(existing);
                    }
                    return existing;
                })
                .orElseGet(() -> {
                    int at = email.indexOf('@');
                    String fallbackName = at > 0 ? email.substring(0, at) : email;
                    String name = (displayName != null && !displayName.isBlank())
                            ? displayName
                            : fallbackName;
                    User nu = User.builder()
                            .email(email)
                            .name(name)
                            .password(null)
                            .role(Role.USER)
                            .authProvider(AuthProvider.GOOGLE)
                            .build();
                    return userRepository.save(nu);
                });
    }
    
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public List<User> findByRole(Role role) {
        return userRepository.findByRole(role);
    }
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public User updateUserRole(String userId, Role newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userId));
        
        user.setRole(newRole);
        return userRepository.save(user);
    }
    
    public void deleteUser(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException("User not found: " + userId);
        }
        userRepository.deleteById(userId);
        log.info("Deleted user with ID: {}", userId);
    }
    
    public Optional<User> findUserById(String userId) {
        return userRepository.findById(userId);
    }
    
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    /**
     * Updates display name, phone, and address for the authenticated user.
     * Phone: blank clears; otherwise exactly 10 digits. Address: trimmed, max 500 chars; blank clears.
     */
    public User updateProfileForEmail(String email, String newName, String phoneRaw, String addressRaw) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        if (newName == null || newName.isBlank()) {
            throw new IllegalArgumentException("Name is required");
        }
        user.setName(newName.trim());
        user.setPhone(normalizePhoneOrNull(phoneRaw));
        user.setAddress(normalizeAddressOrNull(addressRaw));
        return userRepository.save(user);
    }

    private static String normalizePhoneOrThrow(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("Phone is required");
        }
        return normalizePhoneOrNull(raw);
    }

    private static String normalizePhoneOrNull(String raw) {
        if (raw == null) {
            return null;
        }
        String compact = raw.trim().replaceAll("\\s+", "");
        if (compact.isEmpty()) {
            return null;
        }
        if (compact.chars().anyMatch(c -> !Character.isDigit(c))) {
            throw new IllegalArgumentException("Phone must contain digits only (no minus or other characters)");
        }
        if (compact.length() != 10) {
            throw new IllegalArgumentException("Phone must be exactly 10 digits");
        }
        return compact;
    }

    private static String normalizeAddressOrThrow(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("Address is required");
        }
        return normalizeAddressOrNull(raw);
    }

    private static String normalizeAddressOrNull(String raw) {
        if (raw == null) {
            return null;
        }
        String t = raw.trim();
        if (t.isEmpty()) {
            return null;
        }
        if (t.length() > 500) {
            throw new IllegalArgumentException("Address must be at most 500 characters");
        }
        return t;
    }

    public void deleteAccountByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        userRepository.deleteById(user.getId());
        log.info("User deleted own account: {}", email);
    }
}
