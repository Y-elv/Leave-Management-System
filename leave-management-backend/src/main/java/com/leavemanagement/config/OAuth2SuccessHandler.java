package com.leavemanagement.config;

import com.leavemanagement.services.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Microsoft / Azure OAuth2 success handler - DISABLED.
 * Uncomment body and restore UserService usage to re-enable Microsoft login.
 */
@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;

    public OAuth2SuccessHandler(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException {
        // Microsoft OAuth2 flow disabled - do not call Microsoft Graph or issue redirect
        // Original: get OAuth2User -> UserService.getCurrentUser(principal) -> JWT -> redirect to frontend/dashboard?token=...
        // OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        // User user = userService.getCurrentUser(oAuth2User);
        // String token = jwtService.generateToken(user);
        // String redirectUrl = String.format("%s/dashboard?token=%s", frontendUrl, URLEncoder.encode(token, UTF_8));
        // getRedirectStrategy().sendRedirect(request, response, redirectUrl);
        response.sendRedirect(request.getContextPath() + "/api/health");
    }
}
