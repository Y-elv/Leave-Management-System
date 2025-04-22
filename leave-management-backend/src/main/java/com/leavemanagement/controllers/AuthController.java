package com.leavemanagement.controllers;

import com.leavemanagement.dtos.UserDTO;
import com.leavemanagement.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<String> login() {
        // Simulated login - in real implementation, this would integrate with Microsoft Authenticator
        System.out.println("User login attempt - Microsoft Authenticator integration required");
        return ResponseEntity.ok("Login successful - Token would be returned here");
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() {
        // In real implementation, email would come from security context
        String simulatedEmail = "user@example.com";
        return ResponseEntity.ok(userService.getCurrentUser(simulatedEmail));
    }
}
