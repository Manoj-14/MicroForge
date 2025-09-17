package com.microservices.login.controller;

import com.microservices.login.dto.ApiResponse;
import com.microservices.login.dto.UpdateUserRequest;
import com.microservices.login.dto.UserResponse;
import com.microservices.login.model.User;
import com.microservices.login.service.UserService;
import com.microservices.login.security.JwtAuthenticationToken;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getUserProfile(Authentication authentication) {
        try {
            JwtAuthenticationToken jwtAuth = (JwtAuthenticationToken) authentication;
            String username = jwtAuth.getName();

            User user = userService.findByUsername(username);
            UserResponse userResponse = new UserResponse(user);

            return ResponseEntity.ok(userResponse);
        } catch (Exception e) {
            logger.error("Error retrieving user profile: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Error retrieving user profile"));
        }
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> updateUserProfile(@Valid @RequestBody UpdateUserRequest updateRequest,
                                               Authentication authentication) {
        try {
            JwtAuthenticationToken jwtAuth = (JwtAuthenticationToken) authentication;
            String username = jwtAuth.getName();

            User updatedUser = userService.updateUserProfile(username, updateRequest);
            UserResponse userResponse = new UserResponse(updatedUser);

            logger.info("User profile updated for: {}", username);
            return ResponseEntity.ok(userResponse);
        } catch (Exception e) {
            logger.error("Error updating user profile: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Error updating user profile"));
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userService.findAllActiveUsers();
            List<UserResponse> userResponses = users.stream()
                    .map(UserResponse::new)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(userResponses);
        } catch (Exception e) {
            logger.error("Error retrieving users: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Error retrieving users"));
        }
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId, Authentication authentication) {
        try {
            JwtAuthenticationToken jwtAuth = (JwtAuthenticationToken) authentication;
            String currentUsername = jwtAuth.getName();

            userService.deactivateUser(userId, currentUsername);

            logger.info("User {} deactivated by {}", userId, currentUsername);
            return ResponseEntity.ok(new ApiResponse(true, "User deactivated successfully"));
        } catch (Exception e) {
            logger.error("Error deactivating user {}: {}", userId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Error deactivating user"));
        }
    }
}