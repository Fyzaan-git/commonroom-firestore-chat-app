package com.commonroom.chat.model;

import java.time.Instant;

public class User {
    private String uid;
    private String email;
    private String displayName;
    private String passwordHash;
    private String photoURL;
    private String status; // "ONLINE", "AWAY", "OFFLINE"
    private String statusMessage;
    private Long createdAt;
    private Long updatedAt;
    private Long lastSeen;

    public User() {
    }

    public User(String uid, String email, String displayName, String passwordHash, String photoURL) {
        this.uid = uid;
        this.email = email;
        this.displayName = displayName;
        this.passwordHash = passwordHash;
        this.photoURL = photoURL;
        this.status = "ONLINE";
        this.statusMessage = "";
        long now = Instant.now().toEpochMilli();
        this.createdAt = now;
        this.updatedAt = now;
        this.lastSeen = now;
    }

    public String getUid() {
        return uid;
    }

    public void setUid(String uid) {
        this.uid = uid;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getPhotoURL() {
        return photoURL;
    }

    public void setPhotoURL(String photoURL) {
        this.photoURL = photoURL;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getStatusMessage() {
        return statusMessage;
    }

    public void setStatusMessage(String statusMessage) {
        this.statusMessage = statusMessage;
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

    public Long getLastSeen() {
        return lastSeen;
    }

    public void setLastSeen(Long lastSeen) {
        this.lastSeen = lastSeen;
    }
}
