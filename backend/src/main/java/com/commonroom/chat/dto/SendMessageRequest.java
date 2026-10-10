package com.commonroom.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SendMessageRequest {
    @NotBlank(message = "Message text cannot be empty")
    @Size(max = 4000, message = "Message exceeds max length of 4000 characters")
    private String text;

    private String replyToMessageId;
    private String replyToSenderName;
    private String replyToText;

    public SendMessageRequest() {
    }

    public SendMessageRequest(String text) {
        this.text = text;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getReplyToMessageId() {
        return replyToMessageId;
    }

    public void setReplyToMessageId(String replyToMessageId) {
        this.replyToMessageId = replyToMessageId;
    }

    public String getReplyToSenderName() {
        return replyToSenderName;
    }

    public void setReplyToSenderName(String replyToSenderName) {
        this.replyToSenderName = replyToSenderName;
    }

    public String getReplyToText() {
        return replyToText;
    }

    public void setReplyToText(String replyToText) {
        this.replyToText = replyToText;
    }
}
