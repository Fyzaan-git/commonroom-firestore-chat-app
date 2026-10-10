package com.commonroom.chat.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

public class CreateConversationRequest {
    @NotBlank(message = "Workspace ID is required")
    private String workspaceId;

    @NotBlank(message = "Conversation type is required (DIRECT or GROUP)")
    private String type; // "DIRECT" or "GROUP"

    private String name; // Required for group
    private String description;
    private List<String> participantIds = new ArrayList<>();

    public CreateConversationRequest() {
    }

    public CreateConversationRequest(String workspaceId, String type, String name, String description, List<String> participantIds) {
        this.workspaceId = workspaceId;
        this.type = type;
        this.name = name;
        this.description = description;
        this.participantIds = participantIds != null ? participantIds : new ArrayList<>();
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

    public List<String> getParticipantIds() {
        return participantIds;
    }

    public void setParticipantIds(List<String> participantIds) {
        this.participantIds = participantIds;
    }
}
