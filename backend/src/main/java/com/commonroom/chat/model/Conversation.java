package com.commonroom.chat.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class Conversation {
    private String conversationId;
    private String workspaceId;
    private String type; // "DIRECT" or "GROUP"
    private String name; // Group name or null/empty for direct
    private String description;
    private String createdBy;
    private List<String> participantIds = new ArrayList<>();
    private Long createdAt;
    private Long updatedAt;
    private Long lastMessageAt;
    private String lastMessageText;
    private String lastMessageSenderId;

    public Conversation() {
    }

    public Conversation(String conversationId, String workspaceId, String type, String name, String createdBy, List<String> participantIds) {
        this.conversationId = conversationId;
        this.workspaceId = workspaceId;
        this.type = type;
        this.name = name;
        this.createdBy = createdBy;
        this.participantIds = participantIds != null ? participantIds : new ArrayList<>();
        long now = Instant.now().toEpochMilli();
        this.createdAt = now;
        this.updatedAt = now;
        this.lastMessageAt = now;
    }

    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }

    public String getWorkspaceId() {
        return workspaceId;
    }

    public void setWorkspaceId(String workspaceId) {
        this.workspaceId = workspaceId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public List<String> getParticipantIds() {
        return participantIds;
    }

    public void setParticipantIds(List<String> participantIds) {
        this.participantIds = participantIds;
    }

    public Long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Long createdAt) {
        this.createdAt = createdAt;
    }

    public Long getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Long updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Long getLastMessageAt() {
        return lastMessageAt;
    }

    public void setLastMessageAt(Long lastMessageAt) {
        this.lastMessageAt = lastMessageAt;
    }

    public String getLastMessageText() {
        return lastMessageText;
    }

    public void setLastMessageText(String lastMessageText) {
        this.lastMessageText = lastMessageText;
    }

    public String getLastMessageSenderId() {
        return lastMessageSenderId;
    }

    public void setLastMessageSenderId(String lastMessageSenderId) {
        this.lastMessageSenderId = lastMessageSenderId;
    }
}
