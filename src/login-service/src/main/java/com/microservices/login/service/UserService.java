package com.microservices.login.service;

import com.microservices.login.dto.RegisterRequest;
import com.microservices.login.dto.UpdateUserRequest;
import com.microservices.login.exception.EmailAlreadyExistsException;
import com.microservices.login.model.User;
import com.microservices.login.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    }

    public User findById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
    }

    public List<User> findAllActiveUsers() {
        return userRepository.findAllActiveUsers();
    }


    public User createUser(RegisterRequest registerRequest) {
        if(userRepository.existsByEmail(registerRequest.getEmail())) {
            logger.warn("Attempt to register with existing email: {}", registerRequest.getEmail());
            throw new EmailAlreadyExistsException("A User is already registered with current mail");
        }
        User user=new User();
        user.setUsername(registerRequest.getUsername());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setEmail(registerRequest.getEmail());
        user.setIsActive(true);
        logger.info("New user registered: {}", user.getUsername());
        return userRepository.save(user);
    }
    public User updateUserProfile(String username, UpdateUserRequest updateRequest) {
        User user = findByUsername(username);

        if (updateRequest.getFirstName() != null) {
            user.setFirstName(updateRequest.getFirstName());
        }
        if (updateRequest.getLastName() != null) {
            user.setLastName(updateRequest.getLastName());
        }
        if (updateRequest.getEmail() != null) {
            // Check if email is already taken by another user
            if (userRepository.existsByEmail(updateRequest.getEmail()) &&
                    !user.getEmail().equals(updateRequest.getEmail())) {
                throw new RuntimeException("Email is already taken by another user");
            }
            user.setEmail(updateRequest.getEmail());
        }

        User updatedUser = userRepository.save(user);
        logger.info("User profile updated for username: {}", username);

        return updatedUser;
    }

    public void deactivateUser(Long userId, String currentUsername) {
        User currentUser = findByUsername(currentUsername);
        User userToDeactivate = findById(userId);

        // Prevent self-deactivation
        if (currentUser.getId().equals(userId)) {
            throw new AccessDeniedException("You cannot deactivate your own account");
        }

        userToDeactivate.setIsActive(false);
        userRepository.save(userToDeactivate);

        logger.info("User {} deactivated by user {}", userId, currentUsername);
    }

//    public User createUser(User user) {
//        // Check if username already exists
//        if (userRepository.existsByUsername(user.getUsername())) {
//            throw new RuntimeException("Username is already taken");
//        }
//
//        // Check if email already exists
//        if (userRepository.existsByEmail(user.getEmail())) {
//            throw new RuntimeException("Email is already taken");
//        }
//
//        User savedUser = userRepository.save(user);
//        logger.info("New user created: {}", savedUser.getUsername());
//
//        return savedUser;
//    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
}