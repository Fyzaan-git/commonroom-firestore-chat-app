package com.commonroom.chat.controller;

import com.commonroom.chat.dto.ApiResponse;
import com.commonroom.chat.dto.AuthResponse;
import com.commonroom.chat.dto.LoginRequest;
import com.commonroom.chat.dto.PasswordResetRequest;
import com.commonroom.chat.dto.RegisterRequest;
import com.commonroom.chat.model.User;
import com.commonroom.chat.security.UserPrincipal;
import com.commonroom.chat.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("User registered successfully", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal != null) {
            authService.logout(userPrincipal.getUid());
        }
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", "OK"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        User user = authService.getCurrentUser(userPrincipal.getUid());
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody PasswordResetRequest request) {
        authService.requestPasswordReset(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success(
                "If the email exists in our system, password reset instructions have been dispatched.", "SENT"));
    }
}
