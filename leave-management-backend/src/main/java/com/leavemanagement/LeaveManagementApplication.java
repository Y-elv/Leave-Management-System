package com.leavemanagement;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class LeaveManagementApplication {

    public static void main(String[] args) {

        // Load .env file
        Dotenv dotenv = Dotenv.configure()
                .ignoreIfMissing()
                .load();

        // Make variables visible to Spring Boot
        dotenv.entries().forEach(entry -> System.setProperty(entry.getKey(), entry.getValue()));
        System.out.println("DB_URL = " + System.getProperty("DB_URL"));

        SpringApplication.run(LeaveManagementApplication.class, args);
    }
}
