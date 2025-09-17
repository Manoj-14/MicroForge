package com.microservices.login.service;

import com.microservices.login.dto.UserResponse;
import com.microservices.login.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    @Value("${services.notification.url:http://localhost:8083}")
    private String notificationServiceUrl;

    private final RestTemplate restTemplate;

    public NotificationService() {
        this.restTemplate = new RestTemplate();
    }

    @Async
    public void sendRegistrationNotification(UserResponse user) {
        try {
            logger.info("Sending registration notification for user: {}", user.getUsername());

            Map<String, Object> notificationData = new HashMap<>();
            notificationData.put("username", user.getUsername());
            notificationData.put("email", user.getEmail());
            notificationData.put("firstName", user.getFirstName());
            notificationData.put("lastName", user.getLastName());
            notificationData.put("eventType", "USER_REGISTRATION");
            notificationData.put("timestamp", System.currentTimeMillis());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(notificationData, headers);

            String url = notificationServiceUrl + "/api/notifications/user-registration";
            restTemplate.postForEntity(url, request, String.class);

            logger.info("Registration notification sent successfully for user: {}", user.getUsername());

        } catch (Exception e) {
            logger.error("Failed to send registration notification for user: {}", user.getUsername(), e);
            // Don't throw exception to avoid affecting the main registration flow
        }
    }

    @Async
    public void sendLoginNotification(UserResponse user) {
        try {
            logger.info("Sending login notification for user: {}", user.getUsername());

            Map<String, Object> notificationData = new HashMap<>();
            notificationData.put("username", user.getUsername());
            notificationData.put("email", user.getEmail());
            notificationData.put("firstName", user.getFirstName());
            notificationData.put("lastName", user.getLastName());
            notificationData.put("eventType", "USER_LOGIN");
            notificationData.put("timestamp", System.currentTimeMillis());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(notificationData, headers);

            String url = notificationServiceUrl + "/api/notifications/user-login";
            restTemplate.postForEntity(url, request, String.class);

            logger.info("Login notification sent successfully for user: {}", user.getUsername());

        } catch (Exception e) {
            logger.error("Failed to send login notification for user: {}", user.getUsername(), e);
            // Don't throw exception to avoid affecting the main login flow
        }
    }

    @Async
    public void sendPasswordResetNotification(String email, String resetToken) {
        try {
            logger.info("Sending password reset notification to email: {}", email);

            Map<String, Object> emailData = new HashMap<>();
            emailData.put("type", "email");
            emailData.put("recipient", email);
            emailData.put("subject", "Password Reset Request");
            emailData.put("message", "You requested a password reset. Use this token: " + resetToken);
            emailData.put("priority", "high");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(emailData, headers);

            String url = notificationServiceUrl + "/api/notifications/send";
            restTemplate.postForEntity(url, request, String.class);

            logger.info("Password reset notification sent successfully to email: {}", email);

        } catch (Exception e) {
            logger.error("Failed to send password reset notification to email: {}", email, e);
        }
    }
}