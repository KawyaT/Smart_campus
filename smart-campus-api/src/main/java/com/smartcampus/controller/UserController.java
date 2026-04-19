package com.smartcampus.controller;

import com.smartcampus.model.Role;
import com.smartcampus.model.User;
import com.smartcampus.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    
    @GetMapping("/roles")
    public ResponseEntity<List<Role>> getAllRoles() {
        return ResponseEntity.ok(List.of(Role.values()));
    }
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        return ResponseEntity.ok(userService.createUser(user));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER','ADMIN','TECHNICIAN')")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        return userService.findUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{id}/role")
    public ResponseEntity<String> updateUserRole(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        
        System.out.println("DEBUG: PUT endpoint reached!");
        System.out.println("DEBUG: Request body: " + request);
        String roleString = request.get("role");
        System.out.println("DEBUG: Role string from request: " + roleString);
        
        try {
            Role newRole = Role.fromString(roleString);
            System.out.println("DEBUG: Parsed Role enum: " + newRole);
            
            User updatedUser = userService.updateUserRole(id, newRole);
            System.out.println("DEBUG: Updated user role: " + updatedUser.getRole());
            
            return ResponseEntity.ok("Role updated to: " + updatedUser.getRole());
        } catch (Exception e) {
            System.out.println("DEBUG: Error: " + e.getMessage());
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
