package com.leavemanagement.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    // Microsoft / Azure OAuth2 disabled - handler not used
    @Autowired(required = false)
    private OAuth2SuccessHandler oAuth2SuccessHandler;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/health").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        // .requestMatchers("/login/oauth2/**", "/oauth2/**").permitAll() // Microsoft OAuth2 disabled
                        .anyRequest().authenticated());
        // Microsoft / Azure OAuth2 login disabled - uncomment block below to re-enable
        // if (oAuth2SuccessHandler != null) {
        //     http.oauth2Login(oauth2 -> oauth2.successHandler(oAuth2SuccessHandler));
        //     auth.requestMatchers("/login/oauth2/**", "/oauth2/**").permitAll();
        // }

        return http.build();
    }
}
