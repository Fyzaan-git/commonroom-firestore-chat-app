package com.commonroom.chat.service;

import com.commonroom.chat.dto.SendMessageRequest;
import com.commonroom.chat.exception.ResourceNotFoundException;
import com.commonroom.chat.exception.UnauthorizedException;
import com.commonroom.chat.model.Conversation;
import com.commonroom.chat.model.Message;
import com.commonroom.chat.repository.ConversationRepository;
import com.commonroom.chat.repository.MessageRepository;
import com.commonroom.chat.repository.NotificationRepository;
import com.commonroom.chat.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class MessageServiceTest {

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private ConversationRepository conversationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private MessageService messageService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testSendMessageUnauthorizedWhenNotParticipant() throws ExecutionException, InterruptedException {
        Conversation conv = new Conversation("conv-1", "ws-1", "GROUP", "team-dev", "user-1", Collections.singletonList("user-1"));
        when(conversationRepository.findById("conv-1")).thenReturn(Optional.of(conv));

        SendMessageRequest req = new SendMessageRequest("Hello world!");

        assertThrows(UnauthorizedException.class, () -> {
            messageService.sendMessage("conv-1", "unauthorized-user", req);
        });
    }

    @Test
    void testSendMessageSuccess() throws ExecutionException, InterruptedException {
        Conversation conv = new Conversation("conv-1", "ws-1", "GROUP", "team-dev", "user-1", Arrays.asList("user-1", "user-2"));
        when(conversationRepository.findById("conv-1")).thenReturn(Optional.of(conv));
        when(messageRepository.save(any(Message.class))).thenAnswer(i -> i.getArgument(0));

        SendMessageRequest req = new SendMessageRequest("Ship the sprint demo today!");
        Message msg = messageService.sendMessage("conv-1", "user-1", req);

        assertNotNull(msg);
        assertEquals("Ship the sprint demo today!", msg.getText());
        assertEquals("user-1", msg.getSenderId());
        verify(messageRepository, times(1)).save(any(Message.class));
    }
}
