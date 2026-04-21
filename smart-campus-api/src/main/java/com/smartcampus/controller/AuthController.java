package com.smartcampus.controller;

import com.smartcampus.model.AuthProvider;
import com.smartcampus.model.Role;
import com.smartcampus.model.User;
import com.smartcampus.security.JwtService;
import com.smartcampus.exception.UserNotFoundException;
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

import java.util.LinkedHashMap;
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
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("message", "Login successful");
            body.put("success", true);
            body.put("token", token);
            body.put("user", toUserMap(user));
            return ResponseEntity.ok(body);
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
        String phone = readTrimmedString(signupRequest, "phone");
        String address = readTrimmedString(signupRequest, "address");

        log.info("Registration attempt for user: {}", email);

        try {
            if (phone == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "message", "Contact number is required",
                        "success", false
                ));
            }
            if (address == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "message", "Address is required",
                        "success", false
                ));
            }

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
                    .phone(phone)
                    .address(address)
                    .build();
            
            User savedUser = userService.createUser(user);

            Map<String, Object> ok = new LinkedHashMap<>();
            ok.put("message", "Registration successful");
            ok.put("success", true);
            ok.put("user", toUserMap(savedUser));
            return ResponseEntity.ok(ok);
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
                .map(user -> ResponseEntity.ok(toUserMap(user)))
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
        try {
            User existing = userService.findByEmail(email)
                    .orElseThrow(() -> new UserNotFoundException("User not found"));
            String newName = body != null ? body.get("name") : null;
            if (newName == null || newName.isBlank()) {
                newName = existing.getName();
            }
            String phoneRaw = body != null && body.containsKey("phone")
                    ? body.get("phone")
                    : existing.getPhone();
            String addressRaw = body != null && body.containsKey("address")
                    ? body.get("address")
                    : existing.getAddress();
            User updated = userService.updateProfileForEmail(email, newName, phoneRaw, addressRaw);
            return ResponseEntity.ok(toUserMap(updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(401).build();
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

    private static Map<String, Object> toUserMap(User user) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", user.getId());
        m.put("email", user.getEmail());
        m.put("name", user.getName());
        m.put("role", user.getRole().getName());
        m.put("authProvider", user.getAuthProvider() != null ? user.getAuthProvider().name() : "LOCAL");
        m.put("phone", user.getPhone());
        m.put("address", user.getAddress());
        return m;
    }

    private static String readTrimmedString(Map<String, Object> map, String key) {
        if (map == null) {
            return null;
        }
        Object v = map.get(key);
        if (v == null) {
            return null;
        }
        if (v instanceof Number n) {
            long lv = n.longValue();
            if (lv < 0) {
                return null;
            }
            return Long.toString(lv);
        }
        String s = v.toString().trim();
        return s.isEmpty() ? null : s;
    }
}
