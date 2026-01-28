package com.leavemanagement.services;

import com.leavemanagement.dtos.LoginRequest;
import com.leavemanagement.dtos.LoginResponse;
import com.leavemanagement.dtos.RegisterRequest;
import com.leavemanagement.models.User;
import com.leavemanagement.models.UserRole;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserService userService;
    private final JwtService jwtService;

    public AuthService(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    public LoginResponse register(RegisterRequest registerRequest) {
        // Check if user already exists
        User existing;
        try {
            existing = userService.getUserByEmail(registerRequest.getEmail());
        } catch (EntityNotFoundException ex) {
            existing = null;
        }

        if (existing != null) {
            throw new RuntimeException("User already exists with this email");
        }

        User user = new User();
        user.setFullName(registerRequest.getFullName());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(registerRequest.getPassword());

        // Map requested role to enum; default to STAFF if not provided/invalid
        UserRole role = UserRole.STAFF;
        if (registerRequest.getRole() != null && !registerRequest.getRole().isBlank()) {
            try {
                role = UserRole.valueOf(registerRequest.getRole().trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {
                // keep default STAFF
            }
        }
        user.setRole(role);

        User savedUser = userService.saveUser(user);

        String token = jwtService.generateToken(savedUser);

        LoginResponse response = new LoginResponse();
        response.setToken(token);

        LoginResponse.UserDetails userDetails = new LoginResponse.UserDetails();
        userDetails.setId(savedUser.getId());
        userDetails.setEmail(savedUser.getEmail());
        userDetails.setFullName(savedUser.getFullName());
        userDetails.setRole(savedUser.getRole());
        userDetails.setProfilePictureUrl(savedUser.getProfilePictureUrl());
        userDetails.setLeaveBalance(savedUser.getLeaveBalance());
        userDetails.setCarryOverBalance(savedUser.getCarryOverBalance());

        response.setUser(userDetails);
        return response;
    }

    public LoginResponse login(LoginRequest loginRequest) {
        try {
            // Find user by email
            User user = userService.getUserByEmail(loginRequest.getEmail());

            // Validate password for local/JWT users (Microsoft OAuth2 disabled)
            if (user.getPassword() != null) {
                if (!user.getPassword().equals(loginRequest.getPassword())) {
                    throw new RuntimeException("Invalid credentials");
                }
            }

            // Generate JWT token
            String token = jwtService.generateToken(user);

            // Create response with user details
            LoginResponse response = new LoginResponse();
            response.setToken(token);

            LoginResponse.UserDetails userDetails = new LoginResponse.UserDetails();
            userDetails.setId(user.getId());
            userDetails.setEmail(user.getEmail());
            userDetails.setFullName(user.getFullName());
            userDetails.setRole(user.getRole());
            userDetails.setProfilePictureUrl(user.getProfilePictureUrl());
            userDetails.setLeaveBalance(user.getLeaveBalance());
            userDetails.setCarryOverBalance(user.getCarryOverBalance());

            response.setUser(userDetails);

            return response;
        } catch (EntityNotFoundException e) {
            throw new RuntimeException("Invalid credentials");
        }
    }
}
