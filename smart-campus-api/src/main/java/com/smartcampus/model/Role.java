package com.smartcampus.model;

public enum Role {
    USER("USER"),
    ADMIN("ADMIN"),
    TECHNICIAN("TECHNICIAN");

    private final String name;

    Role(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public static Role fromString(String roleName) {
        for (Role role : Role.values()) {
            if (role.name.equalsIgnoreCase(roleName)) {
                return role;
            }
        }
        throw new IllegalArgumentException("Unknown role: " + roleName);
    }
}
