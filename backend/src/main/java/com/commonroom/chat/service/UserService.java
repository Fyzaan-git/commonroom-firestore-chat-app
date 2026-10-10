package com.commonroom.chat.service;

import com.commonroom.chat.dto.UpdateUserRequest;
import com.commonroom.chat.exception.ResourceNotFoundException;
import com.commonroom.chat.model.User;
import com.commonroom.chat.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User getUserById(String uid) {
        try {
            User user = userRepository.findById(uid)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + uid));
            user.setPasswordHash(null);
            return user;
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Database error: " + e.getMessage(), e);
        }
    }

    public List<User> searchUsers(String query) {
        try {
            List<User> list = userRepository.searchByNameOrEmail(query);
            for (User u : list) {
                u.setPasswordHash(null);
            }
            return list;
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Database error: " + e.getMessage(), e);
        }
    }

    public User updateUserProfile(String uid, UpdateUserRequest request) {
        try {
            User user = userRepository.findById(uid)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + uid));

            if (request.getDisplayName() != null && !request.getDisplayName().isBlank()) {
                user.setDisplayName(request.getDisplayName().trim());
            }
            if (request.getPhotoURL() != null && !request.getPhotoURL().isBlank()) {
                user.setPhotoURL(request.getPhotoURL().trim());
            }
            if (request.getStatus() != null && !request.getStatus().isBlank()) {
                user.setStatus(request.getStatus().trim());
            }
            if (request.getStatusMessage() != null) {
                user.setStatusMessage(request.getStatusMessage().trim());
            }
            user.setUpdatedAt(Instant.now().toEpochMilli());

            userRepository.save(user);
            user.setPasswordHash(null);
            return user;
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Database error: " + e.getMessage(), e);
        }
    }
}
