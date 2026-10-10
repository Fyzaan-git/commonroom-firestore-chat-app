package com.commonroom.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateWorkspaceRequest {
    @NotBlank(message = "Workspace name is required")
    @Size(min = 2, max = 50, message = "Workspace name must be between 2 and 50 characters")
    private String name;

    private String description;

    public CreateWorkspaceRequest() {
    }

    public CreateWorkspaceRequest(String name, String description) {
        this.name = name;
        this.description = description;
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
}
