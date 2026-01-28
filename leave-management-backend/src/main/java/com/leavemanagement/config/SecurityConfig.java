package com.leavemanagement.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final OAuth2SuccessHandler oAuth2SuccessHandler;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Apply CORS using global configuration
                .cors(Customizer.withDefaults())
                // Stateless API with JWT
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // Registration & login APIs must be public and JSON-only
                        .requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login").permitAll()
                        // Other auth helper endpoints (e.g. Microsoft login URL) should be public
                        .requestMatchers("/api/auth/**").permitAll()
                        // OAuth2 endpoints used during Microsoft login
                        .requestMatchers("/login/oauth2/**", "/oauth2/**").permitAll()
                        // Everything else requires authentication (JWT or OAuth2)
                        .anyRequest().authenticated())
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(oAuth2SuccessHandler));

        return http.build();
    }
}
