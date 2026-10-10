package com.commonroom.chat.controller;

import com.commonroom.chat.dto.ApiResponse;
import com.commonroom.chat.dto.ReactionRequest;
import com.commonroom.chat.dto.SendMessageRequest;
import com.commonroom.chat.dto.UpdateMessageRequest;
import com.commonroom.chat.model.Message;
import com.commonroom.chat.security.UserPrincipal;
import com.commonroom.chat.service.MessageService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations/{conversationId}/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Message>>> getMessages(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String conversationId,
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(required = false) Long before) {
        List<Message> messages = messageService.getConversationMessages(conversationId, userPrincipal.getUid(), limit, before);
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Message>> sendMessage(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String conversationId,
            @Valid @RequestBody SendMessageRequest request) {
        Message sent = messageService.sendMessage(conversationId, userPrincipal.getUid(), request);
        return ResponseEntity.ok(ApiResponse.success("Message sent", sent));
    }

    @PutMapping("/{messageId}")
    public ResponseEntity<ApiResponse<Message>> updateMessage(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String conversationId,
            @PathVariable String messageId,
            @Valid @RequestBody UpdateMessageRequest request) {
        Message updated = messageService.updateMessage(conversationId, messageId, userPrincipal.getUid(), request);
        return ResponseEntity.ok(ApiResponse.success("Message updated", updated));
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<ApiResponse<String>> deleteMessage(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String conversationId,
            @PathVariable String messageId) {
        messageService.deleteMessage(conversationId, messageId, userPrincipal.getUid());
        return ResponseEntity.ok(ApiResponse.success("Message deleted", "OK"));
    }

    @PostMapping("/{messageId}/reactions")
    public ResponseEntity<ApiResponse<Message>> toggleReaction(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String conversationId,
            @PathVariable String messageId,
            @Valid @RequestBody ReactionRequest request) {
        Message updated = messageService.toggleReaction(conversationId, messageId, userPrincipal.getUid(), request.getEmoji());
        return ResponseEntity.ok(ApiResponse.success("Reaction updated", updated));
    }

    @PostMapping("/{messageId}/pin")
    public ResponseEntity<ApiResponse<Message>> togglePin(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String conversationId,
            @PathVariable String messageId) {
        Message updated = messageService.togglePin(conversationId, messageId, userPrincipal.getUid());
        return ResponseEntity.ok(ApiResponse.success("Pin toggled", updated));
    }
}
