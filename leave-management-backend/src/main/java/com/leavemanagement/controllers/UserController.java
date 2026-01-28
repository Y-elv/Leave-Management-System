package com.leavemanagement.controllers;

import com.leavemanagement.dtos.ChangeRoleDTO;
import com.leavemanagement.dtos.UserDTO;
import com.leavemanagement.models.User;
import com.leavemanagement.models.UserRole;
import com.leavemanagement.services.JwtService;
import com.leavemanagement.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
// import org.springframework.security.oauth2.core.user.OAuth2User; // Microsoft OAuth2 disabled
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private JwtService jwtService;

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(@RequestHeader("Authorization") String authorizationHeader) {
        try {
            // Extract token from Authorization header
            String token = null;
            if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                token = authorizationHeader.substring(7);
            } else {
                return ResponseEntity.status(401).build(); // No token provided
            }

            // Get user from token
            User user = userService.getUserFromToken(token);

            if (user == null) {
                return ResponseEntity.status(401).build(); // Token invalid
            }

            return ResponseEntity.ok(userService.convertToDTO(user));
        } catch (Exception e) {
            return ResponseEntity.status(500).build(); // Some other error
        }
    }


    @GetMapping("/email/{email}")
    public ResponseEntity<UserDTO> getUserByEmail(
            @PathVariable String email,
            @AuthenticationPrincipal Authentication principal
    ) {
        // Only ADMIN can view other users by email
        User currentUser = userService.getCurrentUser();
        if (currentUser.getRole() != UserRole.ADMIN) {
            return ResponseEntity.status(403).build();
        }
        
        try {
            User user = userService.getUserByEmail(email);
            return ResponseEntity.ok(userService.convertToDTO(user));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers(@RequestHeader("Authorization") String authorizationHeader) {
        String token = extractToken(authorizationHeader);
        User currentUser = userService.getUserFromToken(token);

        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }

        if (currentUser.getRole() != UserRole.ADMIN) {
            return ResponseEntity.status(403).build();
        }

        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }





    @GetMapping("/token-info")
    public ResponseEntity<UserDTO> getUserByToken(@RequestHeader("Authorization") String authorizationHeader) {
        try {
            // Extract token from Authorization header (typically in format "Bearer token")
            String token = null;
            if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                token = authorizationHeader.substring(7);
            } else {
                return ResponseEntity.status(401).build();
            }

            // Validate the token and get user information
            // This implementation depends on how your token validation works
            User user = userService.getUserFromToken(token);

            if (user == null) {
                return ResponseEntity.status(401).build();
            }

            return ResponseEntity.ok(userService.convertToDTO(user));
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }

    @PutMapping("/{userId}/change-role")
    public ResponseEntity<UserDTO> changeUserRole(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable Long userId,
            @RequestBody ChangeRoleDTO roleDto) {

        String token = extractToken(authorizationHeader);
        String requesterEmail = jwtService.extractEmail(token);

        // Convert String to Enum
        UserRole roleEnum;
        try {
            roleEnum = UserRole.valueOf(roleDto.getRole().toUpperCase());  // Convert safely
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid role value: " + roleDto.getRole());
        }

        UserDTO updatedUser = userService.changeUserRole(userId, requesterEmail, roleEnum);
        return ResponseEntity.ok(updatedUser);
    }


    private String extractToken(String authorizationHeader) {
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7);
        }
        throw new IllegalArgumentException("Invalid Authorization header");
    }


}
