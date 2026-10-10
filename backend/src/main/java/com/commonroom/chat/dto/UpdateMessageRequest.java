package com.commonroom.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateMessageRequest {
    @NotBlank(message = "Message text cannot be empty")
    @Size(max = 4000, message = "Message exceeds max length of 4000 characters")
    private String text;

    public UpdateMessageRequest() {
    }

    public UpdateMessageRequest(String text) {
        this.text = text;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
}
