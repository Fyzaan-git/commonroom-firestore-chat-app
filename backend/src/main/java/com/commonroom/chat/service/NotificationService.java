package com.commonroom.chat.service;

import com.commonroom.chat.model.Notification;
import com.commonroom.chat.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.ExecutionException;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public List<Notification> getUserNotifications(String userId, int limit) {
        try {
            return notificationRepository.findByRecipientId(userId, limit);
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Database error: " + e.getMessage(), e);
        }
    }

    public void markNotificationRead(String notificationId, String userId) {
        try {
            notificationRepository.findById(notificationId).ifPresent(notif -> {
                if (notif.getRecipientId().equals(userId)) {
                    try {
                        notificationRepository.markAsRead(notificationId);
                    } catch (Exception ignored) {
                    }
                }
            });
        } catch (Exception ignored) {
        }
    }
}
