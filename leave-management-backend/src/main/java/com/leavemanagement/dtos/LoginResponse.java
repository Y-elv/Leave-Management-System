package com.leavemanagement.dtos;

import com.leavemanagement.models.UserRole;
import lombok.Data;

@Data
public class LoginResponse {
    private String token;
    private UserDetails user;

    @Data
    public static class UserDetails {
        private Long id;
        private String email;
        private String fullName;
        private UserRole role;
        private String profilePictureUrl;
        private double leaveBalance;
        private double carryOverBalance;
    }
}
