package com.commonroom.chat.dto;

import jakarta.validation.constraints.NotBlank;

public class AddWorkspaceMemberRequest {
    @NotBlank(message = "User ID is required")
    private String userId;

    private String role = "MEMBER"; // OWNER, ADMIN, MEMBER

    public AddWorkspaceMemberRequest() {
    }

    public AddWorkspaceMemberRequest(String userId, String role) {
        this.userId = userId;
        this.role = role != null ? role : "MEMBER";
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
