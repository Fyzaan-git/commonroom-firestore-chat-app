package com.commonroom.chat.model;

import java.time.Instant;

public class Workspace {
    private String workspaceId;
    private String name;
    private String description;
    private String ownerId;
    private Long createdAt;
    private Long updatedAt;

    public Workspace() {
    }

    public Workspace(String workspaceId, String name, String description, String ownerId) {
        this.workspaceId = workspaceId;
        this.name = name;
        this.description = description;
        this.ownerId = ownerId;
        long now = Instant.now().toEpochMilli();
        this.createdAt = now;
        this.updatedAt = now;
    }

    public String getWorkspaceId() {
        return workspaceId;
    }

    public void setWorkspaceId(String workspaceId) {
        this.workspaceId = workspaceId;
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

    public String getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(String ownerId) {
        this.ownerId = ownerId;
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
}
