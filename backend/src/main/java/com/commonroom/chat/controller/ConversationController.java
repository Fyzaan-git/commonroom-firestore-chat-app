package com.commonroom.chat.controller;

import com.commonroom.chat.dto.AddMemberRequest;
import com.commonroom.chat.dto.ApiResponse;
import com.commonroom.chat.dto.CreateConversationRequest;
import com.commonroom.chat.dto.UpdateConversationRequest;
import com.commonroom.chat.model.Conversation;
import com.commonroom.chat.security.UserPrincipal;
import com.commonroom.chat.service.ConversationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    @Autowired
    private ConversationService conversationService;

    @PostMapping
    public ResponseEntity<ApiResponse<Conversation>> createConversation(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateConversationRequest request) {
        Conversation conversation = conversationService.createConversation(userPrincipal.getUid(), request);
        return ResponseEntity.ok(ApiResponse.success("Conversation created successfully", conversation));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Conversation>>> getConversations(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam String workspaceId) {
        List<Conversation> list = conversationService.getWorkspaceConversations(workspaceId, userPrincipal.getUid());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{conversationId}")
    public ResponseEntity<ApiResponse<Conversation>> getConversation(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String conversationId) {
        Conversation conversation = conversationService.getConversation(conversationId, userPrincipal.getUid());
        return ResponseEntity.ok(ApiResponse.success(conversation));
    }

    @PutMapping("/{conversationId}")
    public ResponseEntity<ApiResponse<Conversation>> updateConversation(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String conversationId,
            @RequestBody UpdateConversationRequest request) {
        Conversation updated = conversationService.updateConversation(conversationId, userPrincipal.getUid(), request);
        return ResponseEntity.ok(ApiResponse.success("Conversation updated successfully", updated));
    }

    @PostMapping("/{conversationId}/members")
    public ResponseEntity<ApiResponse<Conversation>> addMember(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String conversationId,
            @Valid @RequestBody AddMemberRequest request) {
        Conversation updated = conversationService.addMember(conversationId, userPrincipal.getUid(), request);
        return ResponseEntity.ok(ApiResponse.success("Member added to conversation", updated));
    }

    @DeleteMapping("/{conversationId}/members/{userId}")
    public ResponseEntity<ApiResponse<String>> removeMember(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String conversationId,
            @PathVariable String userId) {
        conversationService.removeMember(conversationId, userPrincipal.getUid(), userId);
        return ResponseEntity.ok(ApiResponse.success("Member removed from conversation", "OK"));
    }
}
