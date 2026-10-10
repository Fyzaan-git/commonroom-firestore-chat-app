package com.commonroom.chat.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class Message {
    private String messageId;
    private String conversationId;
    private String workspaceId;
    private String senderId;
    private String text;
    private Long createdAt;
    private Long updatedAt;
    private String replyToMessageId;
    private String replyToSenderName;
    private String replyToText;
    private Boolean edited = false;
    private Boolean deleted = false;
    private Boolean pinned = false;
    private List<Reaction> reactions = new ArrayList<>();
    private List<String> readByUserIds = new ArrayList<>();

    public Message() {
    }

    public Message(String messageId, String conversationId, String workspaceId, String senderId, String text) {
        this.messageId = messageId;
        this.conversationId = conversationId;
        this.workspaceId = workspaceId;
        this.senderId = senderId;
        this.text = text;
        long now = Instant.now().toEpochMilli();
        this.createdAt = now;
        this.updatedAt = now;
        this.edited = false;
        this.deleted = false;
        this.pinned = false;
        this.reactions = new ArrayList<>();
        this.readByUserIds = new ArrayList<>();
        this.readByUserIds.add(senderId);
    }

    public String getMessageId() {
        return messageId;
    }

    public void setMessageId(String messageId) {
        this.messageId = messageId;
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

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
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

    public Boolean getEdited() {
        return edited;
    }

    public void setEdited(Boolean edited) {
        this.edited = edited;
    }

    public Boolean getDeleted() {
        return deleted;
    }

    public void setDeleted(Boolean deleted) {
        this.deleted = deleted;
    }

    public Boolean getPinned() {
        return pinned;
    }

    public void setPinned(Boolean pinned) {
        this.pinned = pinned;
    }

    public List<Reaction> getReactions() {
        return reactions;
    }

    public void setReactions(List<Reaction> reactions) {
        this.reactions = reactions != null ? reactions : new ArrayList<>();
    }

    public List<String> getReadByUserIds() {
        return readByUserIds;
    }

    public void setReadByUserIds(List<String> readByUserIds) {
        this.readByUserIds = readByUserIds != null ? readByUserIds : new ArrayList<>();
    }
}
