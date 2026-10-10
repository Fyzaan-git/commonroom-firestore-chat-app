package com.commonroom.chat.service;

import com.commonroom.chat.dto.AddMemberRequest;
import com.commonroom.chat.dto.CreateConversationRequest;
import com.commonroom.chat.dto.UpdateConversationRequest;
import com.commonroom.chat.exception.BadRequestException;
import com.commonroom.chat.exception.ResourceNotFoundException;
import com.commonroom.chat.exception.UnauthorizedException;
import com.commonroom.chat.model.Conversation;
import com.commonroom.chat.model.Notification;
import com.commonroom.chat.model.User;
import com.commonroom.chat.repository.ConversationRepository;
import com.commonroom.chat.repository.NotificationRepository;
import com.commonroom.chat.repository.UserRepository;
import com.commonroom.chat.repository.WorkspaceMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ExecutionException;

@Service
public class ConversationService {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private WorkspaceMemberRepository workspaceMemberRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    public Conversation createConversation(String currentUserId, CreateConversationRequest request) {
        try {
            // Check workspace membership
            if (workspaceMemberRepository.findByWorkspaceIdAndUserId(request.getWorkspaceId(), currentUserId).isEmpty()) {
                throw new UnauthorizedException("You are not a member of this workspace");
            }

            if ("DIRECT".equalsIgnoreCase(request.getType())) {
                if (request.getParticipantIds() == null || request.getParticipantIds().isEmpty()) {
                    throw new BadRequestException("Direct conversation requires a target participant");
                }
                String targetUserId = request.getParticipantIds().get(0);
                if (targetUserId.equals(currentUserId)) {
                    throw new BadRequestException("Cannot create a direct conversation with yourself");
                }

                // Check if direct conversation already exists
                Optional<Conversation> existing = conversationRepository.findDirectConversation(
                        request.getWorkspaceId(), currentUserId, targetUserId);
                if (existing.isPresent()) {
                    return existing.get();
                }

                String convId = UUID.randomUUID().toString();
                List<String> participants = Arrays.asList(currentUserId, targetUserId);
                Conversation directConv = new Conversation(
                        convId, request.getWorkspaceId(), "DIRECT", null, currentUserId, participants);
                return conversationRepository.save(directConv);
            } else {
                // Group / Channel
                if (request.getName() == null || request.getName().trim().isBlank()) {
                    throw new BadRequestException("Group name is required");
                }

                Set<String> participantSet = new HashSet<>();
                participantSet.add(currentUserId);
                if (request.getParticipantIds() != null) {
                    participantSet.addAll(request.getParticipantIds());
                }

                String convId = UUID.randomUUID().toString();
                Conversation groupConv = new Conversation(
                        convId, request.getWorkspaceId(), "GROUP",
                        request.getName().trim().toLowerCase().replaceAll("\\s+", "-"),
                        currentUserId, new ArrayList<>(participantSet));
                groupConv.setDescription(request.getDescription());

                // Notify invited participants
                User creator = userRepository.findById(currentUserId).orElse(null);
                String creatorName = creator != null ? creator.getDisplayName() : "A team member";
                for (String pId : participantSet) {
                    if (!pId.equals(currentUserId)) {
                        Notification notif = new Notification(
                                UUID.randomUUID().toString(),
                                pId,
                                currentUserId,
                                creatorName,
                                "GROUP_INVITE",
                                convId,
                                groupConv.getName(),
                                null,
                                "Added you to channel #" + groupConv.getName()
                        );
                        notificationRepository.save(notif);
                    }
                }

                return conversationRepository.save(groupConv);
            }
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Database error: " + e.getMessage(), e);
        }
    }

    public List<Conversation> getWorkspaceConversations(String workspaceId, String currentUserId) {
        try {
            return conversationRepository.findByWorkspaceAndParticipant(workspaceId, currentUserId);
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Database error: " + e.getMessage(), e);
        }
    }

    public Conversation getConversation(String conversationId, String currentUserId) {
        try {
            Conversation conversation = conversationRepository.findById(conversationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Conversation not found: " + conversationId));

            if (!conversation.getParticipantIds().contains(currentUserId)) {
                throw new UnauthorizedException("You are not a participant in this conversation");
            }

            return conversation;
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Database error: " + e.getMessage(), e);
        }
    }

    public Conversation updateConversation(String conversationId, String currentUserId, UpdateConversationRequest request) {
        try {
            Conversation conversation = conversationRepository.findById(conversationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Conversation not found: " + conversationId));

            if (!"GROUP".equals(conversation.getType())) {
                throw new BadRequestException("Only group conversations can be updated");
            }

            if (!conversation.getCreatedBy().equals(currentUserId)) {
                throw new UnauthorizedException("Only the channel creator can edit channel details");
            }

            if (request.getName() != null && !request.getName().isBlank()) {
                conversation.setName(request.getName().trim().toLowerCase().replaceAll("\\s+", "-"));
            }
            if (request.getDescription() != null) {
                conversation.setDescription(request.getDescription().trim());
            }
            conversation.setUpdatedAt(Instant.now().toEpochMilli());

            return conversationRepository.save(conversation);
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Database error: " + e.getMessage(), e);
        }
    }

    public Conversation addMember(String conversationId, String currentUserId, AddMemberRequest request) {
        try {
            Conversation conversation = conversationRepository.findById(conversationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Conversation not found: " + conversationId));

            if (!"GROUP".equals(conversation.getType())) {
                throw new BadRequestException("Cannot add members to a direct message");
            }

            if (!conversation.getParticipantIds().contains(currentUserId)) {
                throw new UnauthorizedException("You must be a member of the group to add others");
            }

            if (!conversation.getParticipantIds().contains(request.getUserId())) {
                conversation.getParticipantIds().add(request.getUserId());
                conversation.setUpdatedAt(Instant.now().toEpochMilli());
                conversationRepository.save(conversation);

                User sender = userRepository.findById(currentUserId).orElse(null);
                String senderName = sender != null ? sender.getDisplayName() : "Someone";
                Notification notif = new Notification(
                        UUID.randomUUID().toString(),
                        request.getUserId(),
                        currentUserId,
                        senderName,
                        "GROUP_INVITE",
                        conversationId,
                        conversation.getName(),
                        null,
                        "Added you to channel #" + conversation.getName()
                );
                notificationRepository.save(notif);
            }

            return conversation;
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Database error: " + e.getMessage(), e);
        }
    }

    public void removeMember(String conversationId, String currentUserId, String targetUserId) {
        try {
            Conversation conversation = conversationRepository.findById(conversationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Conversation not found: " + conversationId));

            if (!"GROUP".equals(conversation.getType())) {
                throw new BadRequestException("Cannot remove members from a direct conversation");
            }

            // A user can remove themselves (leave) or channel creator can remove members
            boolean isSelf = currentUserId.equals(targetUserId);
            boolean isCreator = conversation.getCreatedBy().equals(currentUserId);

            if (!isSelf && !isCreator) {
                throw new UnauthorizedException("Only the channel creator can remove other members");
            }

            conversation.getParticipantIds().remove(targetUserId);
            conversation.setUpdatedAt(Instant.now().toEpochMilli());
            conversationRepository.save(conversation);
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Database error: " + e.getMessage(), e);
        }
    }
}
