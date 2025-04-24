package com.leavemanagement.controllers;

import com.leavemanagement.dtos.LoginRequest;
import com.leavemanagement.dtos.LoginResponse;
import com.leavemanagement.services.AuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AuthController {

    @Value("${spring.security.oauth2.client.registration.azure-dev.client-id}")
    private String clientId;

    @Value("${app.oauth2.redirectUri}")
    private String redirectUri;

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.login(loginRequest));
    }

    @GetMapping("/microsoft/url")
    public void redirectToMicrosoftLogin(HttpServletResponse response) throws IOException {
        String baseUrl = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
        String scope = "openid profile email";

        String authUrl = String.format("%s?client_id=%s&response_type=code&redirect_uri=%s&scope=%s&response_mode=query",
                baseUrl, clientId, redirectUri, scope);

        response.sendRedirect(authUrl);
    }
}
