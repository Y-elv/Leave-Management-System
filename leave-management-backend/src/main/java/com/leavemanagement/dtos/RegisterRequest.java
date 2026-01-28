package com.leavemanagement.dtos;

import lombok.Data;

@Data
public class RegisterRequest {
    private String fullName;
    private String email;
    private String password;
    /**
     * Role for the new user: STAFF, MANAGER, or ADMIN.
     */
    private String role;
}

