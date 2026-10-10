import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { conversationsApi, messagesApi } from '../api/client.js';
import { useAuth } from './AuthContext.jsx';
import { useWorkspace } from './WorkspaceContext.jsx';
import { localBackendEngine } from '../api/localBackendEngine.js';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();

  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [messageSearchQuery, setMessageSearchQuery] = useState('');

  const loadConversations = useCallback(async () => {
    if (!user || !currentWorkspace) {
      setConversations([]);
      setCurrentConversation(null);
      setMessages([]);
      return;
    }

    try {
      setLoadingConversations(true);
      const list = await conversationsApi.list(currentWorkspace.workspaceId);
      setConversations(list);

      // Select general or first if none selected
      if (!currentConversation || !list.find(c => c.conversationId === currentConversation.conversationId)) {
        const general = list.find(c => c.type === 'GROUP' && c.name === 'general');
        setCurrentConversation(general || list[0] || null);
      } else {
        // Refresh metadata of current
        const updatedCurrent = list.find(c => c.conversationId === currentConversation.conversationId);
        if (updatedCurrent) setCurrentConversation(updatedCurrent);
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setLoadingConversations(false);
    }
  }, [user, currentWorkspace]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const loadMessages = useCallback(async (convId) => {
    if (!convId) {
      setMessages([]);
      return;
    }
    try {
      setLoadingMessages(true);
      const msgs = await messagesApi.list(convId);
      setMessages(msgs);
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (currentConversation) {
      loadMessages(currentConversation.conversationId);
    } else {
      setMessages([]);
    }
  }, [currentConversation, loadMessages]);

  // Subscribe to real-time events from the in-browser Firestore engine
  useEffect(() => {
    const unsubscribe = localBackendEngine.subscribe(() => {
      if (currentWorkspace && user) {
        conversationsApi.list(currentWorkspace.workspaceId)
          .then(list => {
            setConversations(list);
            if (currentConversation) {
              const freshCurrent = list.find(c => c.conversationId === currentConversation.conversationId);
              if (freshCurrent) setCurrentConversation(freshCurrent);
            }
          })
          .catch(() => {});
      }
      if (currentConversation) {
        messagesApi.list(currentConversation.conversationId)
          .then(setMessages)
          .catch(() => {});
      }
    });

    return unsubscribe;
  }, [currentWorkspace, currentConversation, user]);

  const selectConversation = (conv) => {
    setCurrentConversation(conv);
    setMessageSearchQuery('');
  };

  const sendMessage = async (text, replyTo = null) => {
    if (!currentConversation || !user) return;
    const payload = {
      text,
      replyToMessageId: replyTo ? replyTo.messageId : null,
      replyToSenderName: replyTo ? replyTo.senderName : null,
      replyToText: replyTo ? replyTo.text : null,
    };
    const sent = await messagesApi.send(currentConversation.conversationId, payload);
    setMessages(prev => [...prev, sent]);
    return sent;
  };

  const editMessage = async (messageId, newText) => {
    if (!currentConversation) return;
    const updated = await messagesApi.update(currentConversation.conversationId, messageId, { text: newText });
    setMessages(prev => prev.map(m => (m.messageId === messageId ? updated : m)));
    return updated;
  };

  const deleteMessage = async (messageId) => {
    if (!currentConversation) return;
    await messagesApi.delete(currentConversation.conversationId, messageId);
    setMessages(prev => prev.map(m => (m.messageId === messageId ? { ...m, deleted: true, text: 'This message was deleted' } : m)));
  };

  const toggleReaction = async (messageId, emoji) => {
    if (!currentConversation) return;
    const updated = await messagesApi.toggleReaction(currentConversation.conversationId, messageId, emoji);
    setMessages(prev => prev.map(m => (m.messageId === messageId ? updated : m)));
  };

  const togglePin = async (messageId) => {
    if (!currentConversation) return;
    const updated = await messagesApi.togglePin(currentConversation.conversationId, messageId);
    setMessages(prev => prev.map(m => (m.messageId === messageId ? updated : m)));
  };

  const createGroup = async (name, description, participantIds = []) => {
    if (!currentWorkspace) return;
    const created = await conversationsApi.create({
      workspaceId: currentWorkspace.workspaceId,
      type: 'GROUP',
      name,
      description,
      participantIds,
    });
    setConversations(prev => [created, ...prev]);
    setCurrentConversation(created);
    return created;
  };

  const startDirectMessage = async (targetUser) => {
    if (!currentWorkspace || !user) return;
    const created = await conversationsApi.create({
      workspaceId: currentWorkspace.workspaceId,
      type: 'DIRECT',
      name: null,
      participantIds: [targetUser.uid],
    });
    await loadConversations();
    setCurrentConversation(created);
    return created;
  };

  const updateGroup = async (updates) => {
    if (!currentConversation) return;
    const updated = await conversationsApi.update(currentConversation.conversationId, updates);
    setCurrentConversation(updated);
    setConversations(prev => prev.map(c => (c.conversationId === updated.conversationId ? updated : c)));
    return updated;
  };

  const addMemberToGroup = async (userId) => {
    if (!currentConversation) return;
    const updated = await conversationsApi.addMember(currentConversation.conversationId, userId);
    setCurrentConversation(updated);
    setConversations(prev => prev.map(c => (c.conversationId === updated.conversationId ? updated : c)));
  };

  const removeMemberFromGroup = async (userId) => {
    if (!currentConversation) return;
    await conversationsApi.removeMember(currentConversation.conversationId, userId);
    await loadConversations();
  };

  const channels = useMemo(() => {
    return conversations.filter(c => c.type === 'GROUP');
  }, [conversations]);

  const directMessages = useMemo(() => {
    return conversations.filter(c => c.type === 'DIRECT');
  }, [conversations]);

  const pinnedMessages = useMemo(() => {
    return messages.filter(m => m.pinned && !m.deleted);
  }, [messages]);

  const filteredMessages = useMemo(() => {
    if (!messageSearchQuery.trim()) return messages;
    const q = messageSearchQuery.toLowerCase().trim();
    return messages.filter(m => !m.deleted && m.text.toLowerCase().includes(q));
  }, [messages, messageSearchQuery]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        channels,
        directMessages,
        currentConversation,
        messages: filteredMessages,
        allMessages: messages,
        pinnedMessages,
        loadingConversations,
        loadingMessages,
        typingUsers,
        messageSearchQuery,
        setMessageSearchQuery,
        selectConversation,
        sendMessage,
        editMessage,
        deleteMessage,
        toggleReaction,
        togglePin,
        createGroup,
        startDirectMessage,
        updateGroup,
        addMemberToGroup,
        removeMemberFromGroup,
        refreshConversations: loadConversations,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
}
