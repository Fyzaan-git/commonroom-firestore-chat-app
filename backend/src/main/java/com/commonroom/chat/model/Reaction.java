package com.commonroom.chat.model;

public class Reaction {
    private String emoji;
    private String userId;
    private Long createdAt;

    public Reaction() {
    }

    public Reaction(String emoji, String userId, Long createdAt) {
        this.emoji = emoji;
        this.userId = userId;
        this.createdAt = createdAt;
    }

    public String getEmoji() {
        return emoji;
    }

    public void setEmoji(String emoji) {
        this.emoji = emoji;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Long createdAt) {
        this.createdAt = createdAt;
    }
}
