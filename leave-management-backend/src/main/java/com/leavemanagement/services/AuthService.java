package com.leavemanagement.services;

import com.leavemanagement.dtos.LoginRequest;
import com.leavemanagement.dtos.LoginResponse;
import com.leavemanagement.models.User;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityNotFoundException;

@Service
public class AuthService {
    private final UserService userService;
    private final JwtService jwtService;

    public AuthService(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest loginRequest) {
        try {
            // Find user by email
            User user = userService.getUserByEmail(loginRequest.getEmail());

            // Only validate password for non-Microsoft users (users with password set)
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
