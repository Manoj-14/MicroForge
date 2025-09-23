package com.microservices.login.controller;

import com.microservices.login.dto.ApiResponse;
import com.microservices.login.dto.LoginRequest;
import com.microservices.login.dto.LoginResponse;
import com.microservices.login.dto.RegisterRequest;
import com.microservices.login.service.AuthService;
import com.microservices.login.service.NotificationService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/login")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthService authService;

    @Autowired
    private NotificationService notificationService;

    @PostMapping("/auth")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        logger.info("Login attempt for user: {}", loginRequest.getUsername());

        try {
            LoginResponse response = authService.authenticateUser(loginRequest);
            logger.info("User {} logged in successfully", loginRequest.getUsername());

            // Send notification asynchronously
            notificationService.sendLoginNotification(response.getUser());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Login failed for user {}: {}", loginRequest.getUsername(), e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Error: " + e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        logger.info("Registration attempt for username: {}", registerRequest.getUsername());

        try {
            LoginResponse response = authService.registerUser(registerRequest);
            logger.info("User {} registered successfully", registerRequest.getUsername());

            // Send notification asynchronously
            notificationService.sendRegistrationNotification(response.getUser());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Registration failed for user {}: {}", registerRequest.getUsername(), e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Error: " + e.getMessage()));
        }
    }
}