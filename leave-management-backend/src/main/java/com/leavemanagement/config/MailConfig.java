package com.leavemanagement.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
public class MailConfig {

    @Value("${mail_username:}")
    private String mailUsername;

    @Value("${mail_password:}")
    private String mailPassword;

    @Value("${mail_port:587}")
    private int mailPort;

    @Bean
    @ConditionalOnProperty(name = "mail_username", matchIfMissing = false)
    public JavaMailSender javaMailSender() {
        // This bean will only be created if mail_username is set and not empty
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost("smtp.gmail.com");
        mailSender.setPort(mailPort);
        mailSender.setUsername(mailUsername);
        mailSender.setPassword(mailPassword);

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");
        props.put("mail.smtp.connectiontimeout", "5000");
        props.put("mail.smtp.timeout", "5000");
        props.put("mail.smtp.writetimeout", "5000");

        return mailSender;
    }
}

