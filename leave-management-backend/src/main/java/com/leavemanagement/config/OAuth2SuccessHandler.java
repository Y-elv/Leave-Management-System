package com.leavemanagement.config;

import com.leavemanagement.models.User;
import com.leavemanagement.services.UserService;
import com.leavemanagement.services.JwtService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserService userService;
    private final JwtService jwtService;
    private final String frontendUrl;

    public OAuth2SuccessHandler(
            UserService userService,
            JwtService jwtService,
            @Value("${app.frontend.url}") String frontendUrl
    ) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.frontendUrl = frontendUrl;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        User user = userService.getCurrentUser(oAuth2User);
        
        // Generate JWT token
        String token = jwtService.generateToken(user);
        String encodedToken = URLEncoder.encode(token, StandardCharsets.UTF_8.toString());
        
        // Construct the redirect URL with token
        String redirectUrl = String.format("%s/oauth/callback?token=%s&role=%s", 
            frontendUrl, 
            encodedToken,
            user.getRole().toString().toLowerCase()
        );
        
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
