package com.commonroom.chat.model;

import java.time.Instant;

public class WorkspaceMember {
    private String id;
    private String workspaceId;
    private String userId;
    private String role; // "OWNER", "ADMIN", "MEMBER"
    private Long joinedAt;

    public WorkspaceMember() {
    }

    public WorkspaceMember(String id, String workspaceId, String userId, String role) {
        this.id = id;
        this.workspaceId = workspaceId;
        this.userId = userId;
        this.role = role;
        this.joinedAt = Instant.now().toEpochMilli();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getWorkspaceId() {
        return workspaceId;
    }

    public void setWorkspaceId(String workspaceId) {
        this.workspaceId = workspaceId;
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

    public Long getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(Long joinedAt) {
        this.joinedAt = joinedAt;
    }
}
