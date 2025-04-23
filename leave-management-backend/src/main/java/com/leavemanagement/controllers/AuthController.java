package com.leavemanagement.controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "${app.frontend.url}")
public class AuthController {

    @Value("${spring.security.oauth2.client.registration.azure-dev.client-id}")
    private String clientId;

    @Value("${app.oauth2.redirectUri}")
    private String redirectUri;

    @GetMapping("/microsoft/url")
    public void redirectToMicrosoftLogin(HttpServletResponse response) throws IOException {
        String baseUrl = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
        String scope = "openid profile email";

        String authUrl = String.format("%s?client_id=%s&response_type=code&redirect_uri=%s&scope=%s&response_mode=query",
                baseUrl, clientId, redirectUri, scope);

        response.sendRedirect(authUrl);
    }
}
