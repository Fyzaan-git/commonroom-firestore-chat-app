package com.commonroom.chat.controller;

import com.commonroom.chat.dto.AddWorkspaceMemberRequest;
import com.commonroom.chat.dto.ApiResponse;
import com.commonroom.chat.dto.CreateWorkspaceRequest;
import com.commonroom.chat.model.User;
import com.commonroom.chat.model.Workspace;
import com.commonroom.chat.model.WorkspaceMember;
import com.commonroom.chat.security.UserPrincipal;
import com.commonroom.chat.service.WorkspaceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {

    @Autowired
    private WorkspaceService workspaceService;

    @PostMapping
    public ResponseEntity<ApiResponse<Workspace>> createWorkspace(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateWorkspaceRequest request) {
        Workspace workspace = workspaceService.createWorkspace(userPrincipal.getUid(), request);
        return ResponseEntity.ok(ApiResponse.success("Workspace created successfully", workspace));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Workspace>>> getUserWorkspaces(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<Workspace> workspaces = workspaceService.getUserWorkspaces(userPrincipal.getUid());
        return ResponseEntity.ok(ApiResponse.success(workspaces));
    }

    @GetMapping("/{workspaceId}")
    public ResponseEntity<ApiResponse<Workspace>> getWorkspace(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String workspaceId) {
        Workspace workspace = workspaceService.getWorkspace(workspaceId, userPrincipal.getUid());
        return ResponseEntity.ok(ApiResponse.success(workspace));
    }

    @GetMapping("/{workspaceId}/members")
    public ResponseEntity<ApiResponse<List<User>>> getWorkspaceMembers(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String workspaceId) {
        List<User> members = workspaceService.getWorkspaceMembers(workspaceId, userPrincipal.getUid());
        return ResponseEntity.ok(ApiResponse.success(members));
    }

    @PostMapping("/{workspaceId}/members")
    public ResponseEntity<ApiResponse<WorkspaceMember>> addMember(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String workspaceId,
            @Valid @RequestBody AddWorkspaceMemberRequest request) {
        WorkspaceMember member = workspaceService.addMember(workspaceId, userPrincipal.getUid(), request);
        return ResponseEntity.ok(ApiResponse.success("Member added to workspace", member));
    }
}
