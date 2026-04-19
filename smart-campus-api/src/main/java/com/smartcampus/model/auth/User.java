package com.smartcampus.model.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    private String id;
    
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String phone;
    private String department;
    private UserRole role;
    private UserStatus status;
    
    private String profileImageUrl;
    private String bio;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLogin;
    
    public enum UserRole {
        ADMIN,
        STAFF,
        MAINTAINER,
        USER
    }
    
    public enum UserStatus {
        ACTIVE,
        INACTIVE,
        SUSPENDED
    }
    
    public String getFullName() {
        return firstName + " " + lastName;
    }
}
