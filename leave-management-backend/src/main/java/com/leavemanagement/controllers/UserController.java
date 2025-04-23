package com.leavemanagement.controllers;

import com.leavemanagement.models.User;
import com.leavemanagement.models.UserRole;
import com.leavemanagement.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@AuthenticationPrincipal OAuth2User principal) {
        User user = userService.getCurrentUser(principal);
        return ResponseEntity.ok(user);
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers(@AuthenticationPrincipal OAuth2User principal) {
        // Only ADMIN can view all users
        User currentUser = userService.getCurrentUser(principal);
        if (currentUser.getRole() != UserRole.ADMIN) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/{userId}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable Long userId,
            @RequestBody Map<String, String> roleUpdate,
            @AuthenticationPrincipal OAuth2User principal
    ) {
        // Only ADMIN can update roles
        User currentUser = userService.getCurrentUser(principal);
        if (currentUser.getRole() != UserRole.ADMIN) {
            return ResponseEntity.status(403).build();
        }

        try {
            UserRole newRole = UserRole.valueOf(roleUpdate.get("role"));
            userService.updateUserRole(userId, newRole);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid role");
        }
    }
}
