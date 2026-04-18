package com.smartcampus.controller;

import com.smartcampus.model.Role;
import com.smartcampus.model.User;
import com.smartcampus.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");
        
        log.info("Login attempt for user: {}", email);
        
        try {
            User user = userService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (!passwordEncoder.matches(password, user.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "message", "Invalid credentials",
                    "success", false
                ));
            }
            
            return ResponseEntity.ok(Map.of(
                "message", "Login successful",
                "success", true,
                "user", Map.of(
                    "id", user.getId(),
                    "email", user.getEmail(),
                    "name", user.getName(),
                    "role", user.getRole().getName()
                )
            ));
        } catch (Exception e) {
            log.error("Login failed for user: {}", email, e);
            return ResponseEntity.badRequest().body(Map.of(
                "message", "Login failed: " + e.getMessage(),
                "success", false
            ));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, Object> signupRequest) {
        String name = (String) signupRequest.get("name");
        String email = (String) signupRequest.get("email");
        String password = (String) signupRequest.get("password");
        
        log.info("Registration attempt for user: {}", email);
        
        try {
            if (userService.existsByEmail(email)) {
                return ResponseEntity.badRequest().body(Map.of(
                    "message", "Email already exists",
                    "success", false
                ));
            }
            
            // Public signup is always USER; admin is not self-service
            User user = User.builder()
                    .name(name)
                    .email(email)
                    .password(passwordEncoder.encode(password))
                    .role(Role.USER)
                    .build();
            
            User savedUser = userService.createUser(user);
            
            return ResponseEntity.ok(Map.of(
                "message", "Registration successful",
                "success", true,
                "user", Map.of(
                    "id", savedUser.getId(),
                    "email", savedUser.getEmail(),
                    "name", savedUser.getName(),
                    "role", savedUser.getRole().getName()
                )
            ));
        } catch (Exception e) {
            log.error("Registration failed for user: {}", email, e);
            return ResponseEntity.badRequest().body(Map.of(
                "message", "Registration failed: " + e.getMessage(),
                "success", false
            ));
        }
    }
}
