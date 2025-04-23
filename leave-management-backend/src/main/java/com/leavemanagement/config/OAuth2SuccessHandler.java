package com.leavemanagement.config;

import com.leavemanagement.models.User;
import com.leavemanagement.services.UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserService userService;
    private final String frontendUrl;

    public OAuth2SuccessHandler(
            UserService userService,
            @Value("${app.frontend.url}") String frontendUrl
    ) {
        this.userService = userService;
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
        
        // Construct the redirect URL based on user's role
        String redirectUrl = frontendUrl + "/dashboard/" + user.getRole().toString().toLowerCase();
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
