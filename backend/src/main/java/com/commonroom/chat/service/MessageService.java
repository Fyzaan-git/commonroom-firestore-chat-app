package com.commonroom.chat.service;

import com.commonroom.chat.dto.SendMessageRequest;
import com.commonroom.chat.dto.UpdateMessageRequest;
import com.commonroom.chat.exception.BadRequestException;
import com.commonroom.chat.exception.ResourceNotFoundException;
import com.commonroom.chat.exception.UnauthorizedException;
import com.commonroom.chat.model.Conversation;
import com.commonroom.chat.model.Message;
import com.commonroom.chat.model.Notification;
import com.commonroom.chat.model.Reaction;
import com.commonroom.chat.model.User;
import com.commonroom.chat.repository.ConversationRepository;
import com.commonroom.chat.repository.MessageRepository;
import com.commonroom.chat.repository.NotificationRepository;
import com.commonroom.chat.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ExecutionException;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    public Message sendMessage(String conversationId, String currentUserId, SendMessageRequest request) {
        try {
            Conversation conversation = conversationRepository.findById(conversationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Conversation not found: " + conversationId));

            if (!conversation.getParticipantIds().contains(currentUserId)) {
                throw new UnauthorizedException("You are not a participant in this conversation");
            }

            if (request.getText() == null || request.getText().trim().isBlank()) {
                throw new BadRequestException("Message text cannot be empty");
            }

            String messageId = UUID.randomUUID().toString();
            Message message = new Message(
                    messageId,
                    conversationId,
                    conversation.getWorkspaceId(),
                    currentUserId,
                    request.getText().trim()
            );

            if (request.getReplyToMessageId() != null) {
                message.setReplyToMessageId(request.getReplyToMessageId());
                message.setReplyToSenderName(request.getReplyToSenderName());
                message.setReplyToText(request.getReplyToText());
            }

            messageRepository.save(message);

            // Update conversation last message details
            conversation.setLastMessageAt(message.getCreatedAt());
            conversation.setLastMessageText(message.getText());
            conversation.setLastMessageSenderId(currentUserId);
            conversation.setUpdatedAt(message.getCreatedAt());
            conversationRepository.save(conversation);

            // Notify other participants
            User sender = userRepository.findById(currentUserId).orElse(null);
            String senderName = sender != null ? sender.getDisplayName() : "A team member";

            for (String participantId : conversation.getParticipantIds()) {
                if (!participantId.equals(currentUserId)) {
                    String notifType = "DIRECT".equals(conversation.getType()) ? "DIRECT_MESSAGE" : "CHANNEL_MENTION";
                    Notification notification = new Notification(
                            UUID.randomUUID().toString(),
                            participantId,
                            currentUserId,
                            senderName,
                            notifType,
                            conversationId,
                            conversation.getName(),
                            messageId,
                            senderName + ": " + (message.getText().length() > 60
                                    ? message.getText().substring(0, 60) + "..."
                                    : message.getText())
                    );
                    notificationRepository.save(notification);
                }
            }

            return message;
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Database error: " + e.getMessage(), e);
        }
    }

    public List<Message> getConversationMessages(String conversationId, String currentUserId, int limit, Long before) {
        try {
            Conversation conversation = conversationRepository.findById(conversationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Conversation not found: " + conversationId));

            if (!conversation.getParticipantIds().contains(currentUserId)) {
                throw new UnauthorizedException("You are not a participant in this conversation");
            }

            return messageRepository.findByConversationId(conversationId, limit, before);
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Database error: " + e.getMessage(), e);
        }
    }

    public Message updateMessage(String conversationId, String messageId, String currentUserId, UpdateMessageRequest request) {
        try {
            Message message = messageRepository.findById(messageId)
                    .orElseThrow(() -> new ResourceNotFoundException("Message not found: " + messageId));

            if (!message.getConversationId().equals(conversationId)) {
                throw new BadRequestException("Message does not belong to conversation");
            }

            if (!message.getSenderId().equals(currentUserId)) {
                throw new UnauthorizedException("You can only edit your own messages");
            }

            if (Boolean.TRUE.equals(message.getDeleted())) {
                throw new BadRequestException("Cannot edit a deleted message");
            }

            message.setText(request.getText().trim());
            message.setEdited(true);
            message.setUpdatedAt(Instant.now().toEpochMilli());

            return messageRepository.save(message);
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Database error: " + e.getMessage(), e);
        }
    }

    public void deleteMessage(String conversationId, String messageId, String currentUserId) {
        try {
            Message message = messageRepository.findById(messageId)
                    .orElseThrow(() -> new ResourceNotFoundException("Message not found: " + messageId));

            if (!message.getConversationId().equals(conversationId)) {
                throw new BadRequestException("Message does not belong to conversation");
            }

            if (!message.getSenderId().equals(currentUserId)) {
                throw new UnauthorizedException("You can only delete your own messages");
            }

            message.setDeleted(true);
            message.setText("This message was deleted");
            message.setUpdatedAt(Instant.now().toEpochMilli());
            messageRepository.save(message);
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Database error: " + e.getMessage(), e);
        }
    }

    public Message toggleReaction(String conversationId, String messageId, String currentUserId, String emoji) {
        try {
            Message message = messageRepository.findById(messageId)
                    .orElseThrow(() -> new ResourceNotFoundException("Message not found: " + messageId));

            if (!message.getConversationId().equals(conversationId)) {
                throw new BadRequestException("Message does not belong to conversation");
            }

            Optional<Reaction> existing = message.getReactions().stream()
                    .filter(r -> r.getEmoji().equals(emoji) && r.getUserId().equals(currentUserId))
                    .findFirst();

            if (existing.isPresent()) {
                message.getReactions().remove(existing.get());
            } else {
                message.getReactions().add(new Reaction(emoji, currentUserId, Instant.now().toEpochMilli()));
            }

            return messageRepository.save(message);
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Database error: " + e.getMessage(), e);
        }
    }

    public Message togglePin(String conversationId, String messageId, String currentUserId) {
        try {
            Message message = messageRepository.findById(messageId)
                    .orElseThrow(() -> new ResourceNotFoundException("Message not found: " + messageId));

            if (!message.getConversationId().equals(conversationId)) {
                throw new BadRequestException("Message does not belong to conversation");
            }

            message.setPinned(!Boolean.TRUE.equals(message.getPinned()));
            message.setUpdatedAt(Instant.now().toEpochMilli());
            return messageRepository.save(message);
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Database error: " + e.getMessage(), e);
        }
    }
}
