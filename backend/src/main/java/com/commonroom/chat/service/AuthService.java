package com.commonroom.chat.service;

import com.commonroom.chat.dto.AuthResponse;
import com.commonroom.chat.dto.LoginRequest;
import com.commonroom.chat.dto.RegisterRequest;
import com.commonroom.chat.exception.BadRequestException;
import com.commonroom.chat.exception.ConflictException;
import com.commonroom.chat.exception.ResourceNotFoundException;
import com.commonroom.chat.model.User;
import com.commonroom.chat.repository.UserRepository;
import com.commonroom.chat.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ExecutionException;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    public AuthResponse register(RegisterRequest request) {
        try {
            Optional<User> existing = userRepository.findByEmail(request.getEmail());
            if (existing.isPresent()) {
                throw new ConflictException("User with this email already exists");
            }

            String uid = UUID.randomUUID().toString();
            String hash = passwordEncoder.encode(request.getPassword());
            String photoURL = request.getPhotoURL();
            if (photoURL == null || photoURL.isBlank()) {
                photoURL = "https://api.dicebear.com/7.x/initials/svg?seed=" + request.getDisplayName();
            }

            User user = new User(uid, request.getEmail().toLowerCase().trim(), request.getDisplayName().trim(), hash, photoURL);
            userRepository.save(user);

            String token = tokenProvider.generateToken(user.getUid(), user.getEmail());
            // Do not return password hash in response
            user.setPasswordHash(null);
            return new AuthResponse(token, user);
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Database error during registration: " + e.getMessage(), e);
        }
    }

    public AuthResponse login(LoginRequest request) {
        try {
            Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
            if (userOptional.isEmpty()) {
                throw new BadRequestException("Invalid email or password");
            }

            User user = userOptional.get();
            if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                throw new BadRequestException("Invalid email or password");
            }

            // Update user status and last seen
            user.setStatus("ONLINE");
            user.setLastSeen(Instant.now().toEpochMilli());
            userRepository.save(user);

            String token = tokenProvider.generateToken(user.getUid(), user.getEmail());
            user.setPasswordHash(null);
            return new AuthResponse(token, user);
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Database error during login: " + e.getMessage(), e);
        }
    }

    public User getCurrentUser(String uid) {
        try {
            User user = userRepository.findById(uid)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + uid));
            user.setPasswordHash(null);
            return user;
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Database error fetching user: " + e.getMessage(), e);
        }
    }

    public void logout(String uid) {
        try {
            userRepository.findById(uid).ifPresent(user -> {
                user.setStatus("OFFLINE");
                user.setLastSeen(Instant.now().toEpochMilli());
                try {
                    userRepository.save(user);
                } catch (Exception ignored) {
                }
            });
        } catch (Exception ignored) {
        }
    }

    public void requestPasswordReset(String email) {
        try {
            // Generic response to avoid revealing account existence
            userRepository.findByEmail(email).ifPresent(user -> {
                // In production, send secure reset email token
            });
        } catch (Exception ignored) {
        }
    }
}
