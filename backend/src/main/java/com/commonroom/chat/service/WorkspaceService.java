package com.commonroom.chat.service;

import com.commonroom.chat.dto.AddWorkspaceMemberRequest;
import com.commonroom.chat.dto.CreateWorkspaceRequest;
import com.commonroom.chat.exception.ResourceNotFoundException;
import com.commonroom.chat.exception.UnauthorizedException;
import com.commonroom.chat.model.Conversation;
import com.commonroom.chat.model.User;
import com.commonroom.chat.model.Workspace;
import com.commonroom.chat.model.WorkspaceMember;
import com.commonroom.chat.repository.ConversationRepository;
import com.commonroom.chat.repository.UserRepository;
import com.commonroom.chat.repository.WorkspaceMemberRepository;
import com.commonroom.chat.repository.WorkspaceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
public class WorkspaceService {

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private WorkspaceMemberRepository memberRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private UserRepository userRepository;

    public Workspace createWorkspace(String userId, CreateWorkspaceRequest request) {
        try {
            String workspaceId = UUID.randomUUID().toString();
            Workspace workspace = new Workspace(workspaceId, request.getName().trim(), request.getDescription(), userId);
            workspaceRepository.save(workspace);

            // Add creator as OWNER
            WorkspaceMember ownerMember = new WorkspaceMember(null, workspaceId, userId, "OWNER");
            memberRepository.save(ownerMember);

            // Create default general channel
            String generalConvId = UUID.randomUUID().toString();
            Conversation generalChannel = new Conversation(
                    generalConvId,
                    workspaceId,
                    "GROUP",
                    "general",
                    userId,
                    Collections.singletonList(userId)
            );
            generalChannel.setDescription("Company-wide announcements and general discussion");
            conversationRepository.save(generalChannel);

            return workspace;
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Database error creating workspace: " + e.getMessage(), e);
        }
    }

    public List<Workspace> getUserWorkspaces(String userId) {
        try {
            List<WorkspaceMember> memberships = memberRepository.findByUserId(userId);
            List<String> workspaceIds = memberships.stream()
                    .map(WorkspaceMember.getWorkspaceId)
                    .collect(Collectors.toList());

            return workspaceRepository.findAllByIds(workspaceIds);
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Database error: " + e.getMessage(), e);
        }
    }

    public Workspace getWorkspace(String workspaceId, String userId) {
        try {
            Workspace workspace = workspaceRepository.findById(workspaceId)
                    .orElseThrow(() -> new ResourceNotFoundException("Workspace not found: " + workspaceId));

            // Verify membership
            boolean isMember = memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId).isPresent();
            if (!isMember) {
                throw new UnauthorizedException("You are not a member of this workspace");
            }

            return workspace;
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Database error: " + e.getMessage(), e);
        }
    }

    public List<User> getWorkspaceMembers(String workspaceId, String currentUserId) {
        try {
            // Verify current user membership
            if (memberRepository.findByWorkspaceIdAndUserId(workspaceId, currentUserId).isEmpty()) {
                throw new UnauthorizedException("You are not a member of this workspace");
            }

            List<WorkspaceMember> members = memberRepository.findByWorkspaceId(workspaceId);
            List<String> userIds = members.stream().map(WorkspaceMember::getUserId).collect(Collectors.toList());
            List<User> users = userRepository.findAllByIds(userIds);
            for (User u : users) {
                u.setPasswordHash(null);
            }
            return users;
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Database error: " + e.getMessage(), e);
        }
    }

    public WorkspaceMember addMember(String workspaceId, String currentUserId, AddWorkspaceMemberRequest request) {
        try {
            WorkspaceMember currentMember = memberRepository.findByWorkspaceIdAndUserId(workspaceId, currentUserId)
                    .orElseThrow(() -> new UnauthorizedException("You are not a member of this workspace"));

            if (!"OWNER".equals(currentMember.getRole()) && !"ADMIN".equals(currentMember.getRole())) {
                throw new UnauthorizedException("Only workspace owners or admins can add members");
            }

            WorkspaceMember newMember = new WorkspaceMember(null, workspaceId, request.getUserId(), request.getRole());
            memberRepository.save(newMember);

            // Also add user to general channel
            List<Conversation> channels = conversationRepository.findByWorkspaceAndParticipant(workspaceId, currentUserId);
            for (Conversation conv : channels) {
                if ("GROUP".equals(conv.getType()) && "general".equalsIgnoreCase(conv.getName())) {
                    if (!conv.getParticipantIds().contains(request.getUserId())) {
                        conv.getParticipantIds().add(request.getUserId());
                        conversationRepository.save(conv);
                    }
                    break;
                }
            }

            return newMember;
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Database error: " + e.getMessage(), e);
        }
    }
}
