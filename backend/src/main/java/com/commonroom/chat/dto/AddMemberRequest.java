package com.commonroom.chat.dto;

import jakarta.validation.constraints.NotBlank;

public class AddMemberRequest {
    @NotBlank(message = "User ID is required")
    private String userId;

    public AddMemberRequest() {
    }

    public AddMemberRequest(String userId) {
        this.userId = userId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
