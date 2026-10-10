package com.commonroom.chat.controller;

import com.commonroom.chat.dto.ApiResponse;
import com.commonroom.chat.dto.UpdateUserRequest;
import com.commonroom.chat.model.User;
import com.commonroom.chat.security.UserPrincipal;
import com.commonroom.chat.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<User>>> searchUsers(@RequestParam(defaultValue = "") String q) {
        List<User> results = userService.searchUsers(q);
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<User>> getUserById(@PathVariable String userId) {
        User user = userService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<User>> updateProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody UpdateUserRequest request) {
        User updated = userService.updateUserProfile(userPrincipal.getUid(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }
}
