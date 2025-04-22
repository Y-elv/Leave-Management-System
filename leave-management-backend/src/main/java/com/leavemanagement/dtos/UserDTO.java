package com.leavemanagement.dtos;

import com.leavemanagement.models.UserRole;
import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String fullName;
    private String email;
    private UserRole role;
    private String profilePictureUrl;
    private double leaveBalance;
    private double carryOverBalance;
}
