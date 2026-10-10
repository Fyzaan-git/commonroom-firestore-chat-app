package com.commonroom.chat.controller;

import com.commonroom.chat.dto.AuthResponse;
import com.commonroom.chat.dto.LoginRequest;
import com.commonroom.chat.dto.RegisterRequest;
import com.commonroom.chat.model.User;
import com.commonroom.chat.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class AuthControllerTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testRegisterSuccess() {
        RegisterRequest req = new RegisterRequest("Alex Mercer", "alex@example.com", "secret123", null);
        User dummyUser = new User("uid-1", "alex@example.com", "Alex Mercer", null, "avatar.png");
        AuthResponse mockResp = new AuthResponse("mock-jwt-token", dummyUser);

        when(authService.register(any(RegisterRequest.class))).thenReturn(mockResp);

        ResponseEntity<?> response = authController.register(req);
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
    }

    @Test
    void testLoginSuccess() {
        LoginRequest req = new LoginRequest("alex@example.com", "secret123");
        User dummyUser = new User("uid-1", "alex@example.com", "Alex Mercer", null, "avatar.png");
        AuthResponse mockResp = new AuthResponse("mock-jwt-token", dummyUser);

        when(authService.login(any(LoginRequest.class))).thenReturn(mockResp);

        ResponseEntity<?> response = authController.login(req);
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
    }
}
