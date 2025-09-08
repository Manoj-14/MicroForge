package com.microservices.login.service;

import com.microservices.login.dto.LoginRequest;
import com.microservices.login.dto.LoginResponse;
import com.microservices.login.dto.RegisterRequest;
import com.microservices.login.dto.UserResponse;
import com.microservices.login.model.User;
import com.microservices.login.repository.UserRepository;
import com.microservices.login.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    public LoginResponse authenticateUser(LoginRequest loginRequest) {
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!user.getIsActive()) {
            throw new BadCredentialsException("Account is deactivated");
        }

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        String jwt = tokenProvider.generateToken(user.getUsername());
        UserResponse userResponse = new UserResponse(user);

        logger.info("User {} authenticated successfully", user.getUsername());
        return new LoginResponse(jwt, userResponse);
    }

    public LoginResponse registerUser(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email is already in use!");
        }

        // Create new user
        User user = new User(
                registerRequest.getUsername(),
                registerRequest.getEmail(),
                passwordEncoder.encode(registerRequest.getPassword()),
                registerRequest.getFirstName(),
                registerRequest.getLastName()
        );

        User savedUser = userRepository.save(user);
        String jwt = tokenProvider.generateToken(savedUser.getUsername());
        UserResponse userResponse = new UserResponse(savedUser);

        logger.info("New user {} registered successfully", savedUser.getUsername());
        return new LoginResponse(jwt, userResponse);
    }
}