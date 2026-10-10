package com.commonroom.chat.controller;

import com.commonroom.chat.dto.ApiResponse;
import com.commonroom.chat.model.Notification;
import com.commonroom.chat.security.UserPrincipal;
import com.commonroom.chat.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getNotifications(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(defaultValue = "30") int limit) {
        List<Notification> notifications = notificationService.getUserNotifications(userPrincipal.getUid(), limit);
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<String>> markAsRead(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String notificationId) {
        notificationService.markNotificationRead(notificationId, userPrincipal.getUid());
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", "OK"));
    }
}
