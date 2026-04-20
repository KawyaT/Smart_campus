package com.smartcampus.controller;

import com.smartcampus.model.AuthProvider;
import com.smartcampus.model.Role;
import com.smartcampus.model.User;
import com.smartcampus.security.JwtService;
import com.smartcampus.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");
        
        log.info("Login attempt for user: {}", email);
        
        try {
            User user = userService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (user.getAuthProvider() == AuthProvider.GOOGLE
                    || user.getPassword() == null
                    || user.getPassword().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "message", "This account uses Google sign-in",
                        "success", false
                ));
            }

            if (!passwordEncoder.matches(password, user.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "message", "Invalid credentials",
                    "success", false
                ));
            }
            
            String token = jwtService.generateToken(user);
            return ResponseEntity.ok(Map.of(
                "message", "Login successful",
                "success", true,
                "token", token,
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
                    .authProvider(AuthProvider.LOCAL)
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

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> currentUser(Authentication authentication) {
        // AnonymousAuthenticationToken still reports isAuthenticated() == true in Spring Security.
        if (authentication == null
                || authentication instanceof AnonymousAuthenticationToken
                || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        String email = authentication.getName();
        if (email == null || email.isBlank() || "anonymousUser".equalsIgnoreCase(email)) {
            return ResponseEntity.status(401).build();
        }
        return userService.findByEmail(email)
                .map(user -> {
                    String provider = user.getAuthProvider() != null ? user.getAuthProvider().name() : "LOCAL";
                    return ResponseEntity.ok(Map.<String, Object>of(
                            "id", user.getId(),
                            "email", user.getEmail(),
                            "name", user.getName(),
                            "role", user.getRole().getName(),
                            "authProvider", provider
                    ));
                })
                .orElseGet(() -> ResponseEntity.status(401).build());
    }

    @PatchMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        if (!isAuthenticatedUser(authentication)) {
            return ResponseEntity.status(401).build();
        }
        String email = authentication.getName();
        String name = body != null ? body.get("name") : null;
        try {
            User updated = userService.updateNameForEmail(email, name);
            String provider = updated.getAuthProvider() != null ? updated.getAuthProvider().name() : "LOCAL";
            return ResponseEntity.ok(Map.<String, Object>of(
                    "id", updated.getId(),
                    "email", updated.getEmail(),
                    "name", updated.getName(),
                    "role", updated.getRole().getName(),
                    "authProvider", provider
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/account")
    public ResponseEntity<Void> deleteAccount(Authentication authentication) {
        if (!isAuthenticatedUser(authentication)) {
            return ResponseEntity.status(401).build();
        }
        userService.deleteAccountByEmail(authentication.getName());
        return ResponseEntity.noContent().build();
    }

    private static boolean isAuthenticatedUser(Authentication authentication) {
        if (authentication == null
                || authentication instanceof AnonymousAuthenticationToken
                || !authentication.isAuthenticated()) {
            return false;
        }
        String email = authentication.getName();
        return email != null && !email.isBlank() && !"anonymousUser".equalsIgnoreCase(email);
    }
}
