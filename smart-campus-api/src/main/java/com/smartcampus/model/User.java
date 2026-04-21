package com.smartcampus.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "users")
public class User {
    
    @Id
    private String id;
    
    private String email;
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    private String name;
    private Role role;

    /** LOCAL = email/password; GOOGLE = signed in with Google (password may be null). */
    private AuthProvider authProvider;

    /** Exactly 10 digits when set; null if not set (e.g. Google until user adds a full number). */
    private String phone;

    /** Mailing or campus address; null if not set. */
    private String address;
}
