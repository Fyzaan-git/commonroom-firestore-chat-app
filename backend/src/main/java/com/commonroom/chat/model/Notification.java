package com.commonroom.chat.model;

import java.time.Instant;

public class Notification {
    private String notificationId;
    private String recipientId;
    private String senderId;
    private String senderName;
    private String type; // "DIRECT_MESSAGE", "CHANNEL_MENTION", "GROUP_INVITE", "REACTION"
    private String conversationId;
    private String conversationName;
    private String messageId;
    private String content;
    private Boolean isRead = false;
    private Long createdAt;

    public Notification() {
    }

    public Notification(String notificationId, String recipientId, String senderId, String senderName,
                        String type, String conversationId, String conversationName, String messageId, String content) {
        this.notificationId = notificationId;
        this.recipientId = recipientId;
        this.senderId = senderId;
        this.senderName = senderName;
        this.type = type;
        this.conversationId = conversationId;
        this.conversationName = conversationName;
        this.messageId = messageId;
        this.content = content;
        this.isRead = false;
        this.createdAt = Instant.now().toEpochMilli();
    }

    public String getNotificationId() {
        return notificationId;
    }

    public void setNotificationId(String notificationId) {
        this.notificationId = notificationId;
    }

    public String getRecipientId() {
        return recipientId;
    }

    public void setRecipientId(String recipientId) {
        this.recipientId = recipientId;
    }

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }

    public String getConversationName() {
        return conversationName;
    }

    public void setConversationName(String conversationName) {
        this.conversationName = conversationName;
    }

    public String getMessageId() {
        return messageId;
    }

    public void setMessageId(String messageId) {
        this.messageId = messageId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean read) {
        isRead = read;
    }

    public Long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Long createdAt) {
        this.createdAt = createdAt;
    }
}
