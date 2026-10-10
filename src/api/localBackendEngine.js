/**
 * CommonRoom In-Browser Firestore Database Engine
 * 
 * Faithfully mirrors the Cloud Firestore collections & Spring Boot REST API
 * models: users, workspaces, workspaceMembers, conversations, messages, notifications.
 * Persists in localStorage with live event dispatching.
 */

const STORAGE_KEY = 'commonroom_firestore_db_v1';

const INITIAL_USERS = [
  {
    uid: 'user-alex',
    email: 'alex.mercer@commonroom.io',
    displayName: 'Alex Mercer',
    passwordHash: 'argon_hash_demo',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'ONLINE',
    statusMessage: 'Refactoring Spring Boot REST filters ☕',
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 3600000,
    lastSeen: Date.now(),
  },
  {
    uid: 'user-sarah',
    email: 'sarah.chen@commonroom.io',
    displayName: 'Sarah Chen',
    passwordHash: 'argon_hash_demo',
    photoURL: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    status: 'ONLINE',
    statusMessage: 'Designing the new design token spec ✨',
    createdAt: Date.now() - 86400000 * 20,
    updatedAt: Date.now() - 1800000,
    lastSeen: Date.now(),
  },
  {
    uid: 'user-marcus',
    email: 'marcus.vance@commonroom.io',
    displayName: 'Marcus Vance',
    passwordHash: 'argon_hash_demo',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'AWAY',
    statusMessage: 'In customer architecture review meeting',
    createdAt: Date.now() - 86400000 * 45,
    updatedAt: Date.now() - 7200000,
    lastSeen: Date.now() - 3600000,
  },
  {
    uid: 'user-elena',
    email: 'elena.rostova@commonroom.io',
    displayName: 'Elena Rostova',
    passwordHash: 'argon_hash_demo',
    photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    status: 'ONLINE',
    statusMessage: 'Auditing Firestore rules & JWT expiry',
    createdAt: Date.now() - 86400000 * 15,
    updatedAt: Date.now() - 600000,
    lastSeen: Date.now(),
  },
];

const INITIAL_WORKSPACES = [
  {
    workspaceId: 'ws-commonroom',
    name: 'CommonRoom HQ',
    description: 'Primary engineering, design, and company workspace',
    ownerId: 'user-alex',
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000 * 30,
  },
  {
    workspaceId: 'ws-acme-cloud',
    name: 'Acme Architecture Lab',
    description: 'Joint architecture and migration sprint with client engineers',
    ownerId: 'user-marcus',
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 86400000 * 10,
  },
];

const INITIAL_MEMBERS = [
  { id: 'ws-commonroom_user-alex', workspaceId: 'ws-commonroom', userId: 'user-alex', role: 'OWNER', joinedAt: Date.now() - 86400000 * 30 },
  { id: 'ws-commonroom_user-sarah', workspaceId: 'ws-commonroom', userId: 'user-sarah', role: 'ADMIN', joinedAt: Date.now() - 86400000 * 20 },
  { id: 'ws-commonroom_user-marcus', workspaceId: 'ws-commonroom', userId: 'user-marcus', role: 'MEMBER', joinedAt: Date.now() - 86400000 * 15 },
  { id: 'ws-commonroom_user-elena', workspaceId: 'ws-commonroom', userId: 'user-elena', role: 'MEMBER', joinedAt: Date.now() - 86400000 * 10 },
  { id: 'ws-acme-cloud_user-alex', workspaceId: 'ws-acme-cloud', userId: 'user-alex', role: 'ADMIN', joinedAt: Date.now() - 86400000 * 10 },
  { id: 'ws-acme-cloud_user-marcus', workspaceId: 'ws-acme-cloud', userId: 'user-marcus', role: 'OWNER', joinedAt: Date.now() - 86400000 * 10 },
];

const INITIAL_CONVERSATIONS = [
  {
    conversationId: 'conv-general',
    workspaceId: 'ws-commonroom',
    type: 'GROUP',
    name: 'general',
    description: 'Company-wide announcements, team wins, and company events',
    createdBy: 'user-alex',
    participantIds: ['user-alex', 'user-sarah', 'user-marcus', 'user-elena'],
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 120000,
    lastMessageAt: Date.now() - 120000,
    lastMessageText: 'The v1.0 release is validated against Firestore emulator test suites.',
    lastMessageSenderId: 'user-alex',
  },
  {
    conversationId: 'conv-engineering',
    workspaceId: 'ws-commonroom',
    type: 'GROUP',
    name: 'engineering',
    description: 'Technical discussions, code reviews, and architecture RFCs',
    createdBy: 'user-alex',
    participantIds: ['user-alex', 'user-sarah', 'user-marcus', 'user-elena'],
    createdAt: Date.now() - 86400000 * 25,
    updatedAt: Date.now() - 360000,
    lastMessageAt: Date.now() - 360000,
    lastMessageText: 'Java 17 records and JWT interceptors are working cleanly.',
    lastMessageSenderId: 'user-elena',
  },
  {
    conversationId: 'conv-roadmap',
    workspaceId: 'ws-commonroom',
    type: 'GROUP',
    name: 'product-roadmap',
    description: 'Quarterly milestones, user research findings, and design tokens',
    createdBy: 'user-sarah',
    participantIds: ['user-alex', 'user-sarah', 'user-marcus'],
    createdAt: Date.now() - 86400000 * 15,
    updatedAt: Date.now() - 86400000 * 2,
    lastMessageAt: Date.now() - 86400000 * 2,
    lastMessageText: 'Design tokens and WCAG AA contrast checklist completed for CommonRoom.',
    lastMessageSenderId: 'user-sarah',
  },
  {
    conversationId: 'conv-dm-sarah-alex',
    workspaceId: 'ws-commonroom',
    type: 'DIRECT',
    name: null,
    description: null,
    createdBy: 'user-alex',
    participantIds: ['user-alex', 'user-sarah'],
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 1800000,
    lastMessageAt: Date.now() - 1800000,
    lastMessageText: 'Love the new clean typography hierarchy. Feels fast and focused.',
    lastMessageSenderId: 'user-sarah',
  },
  {
    conversationId: 'conv-dm-marcus-alex',
    workspaceId: 'ws-commonroom',
    type: 'DIRECT',
    name: null,
    description: null,
    createdBy: 'user-marcus',
    participantIds: ['user-alex', 'user-marcus'],
    createdAt: Date.now() - 86400000 * 7,
    updatedAt: Date.now() - 86400000,
    lastMessageAt: Date.now() - 86400000,
    lastMessageText: 'Thanks for securing the Firestore security rules boundary.',
    lastMessageSenderId: 'user-marcus',
  },
];

const INITIAL_MESSAGES = [
  {
    messageId: 'msg-gen-1',
    conversationId: 'conv-general',
    workspaceId: 'ws-commonroom',
    senderId: 'user-sarah',
    text: 'Good morning team! Welcome to the new CommonRoom collaboration platform.',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
    replyToMessageId: null,
    edited: false,
    deleted: false,
    pinned: true,
    reactions: [
      { emoji: '👋', userId: 'user-alex', createdAt: Date.now() - 86400000 * 2 + 1000 },
      { emoji: '🎉', userId: 'user-marcus', createdAt: Date.now() - 86400000 * 2 + 2000 },
    ],
    readByUserIds: ['user-sarah', 'user-alex', 'user-marcus', 'user-elena'],
  },
  {
    messageId: 'msg-gen-2',
    conversationId: 'conv-general',
    workspaceId: 'ws-commonroom',
    senderId: 'user-marcus',
    text: 'Our Spring Boot 3 + Cloud Firestore backend architecture is fully operational with security rule enforcement.',
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now() - 86400000 * 1,
    replyToMessageId: null,
    edited: false,
    deleted: false,
    pinned: false,
    reactions: [
      { emoji: '🚀', userId: 'user-alex', createdAt: Date.now() - 86400000 * 1 + 5000 },
    ],
    readByUserIds: ['user-sarah', 'user-alex', 'user-marcus', 'user-elena'],
  },
  {
    messageId: 'msg-gen-3',
    conversationId: 'conv-general',
    workspaceId: 'ws-commonroom',
    senderId: 'user-alex',
    text: 'The v1.0 release is validated against Firestore emulator test suites.',
    createdAt: Date.now() - 120000,
    updatedAt: Date.now() - 120000,
    replyToMessageId: 'msg-gen-2',
    replyToSenderName: 'Marcus Vance',
    replyToText: 'Our Spring Boot 3 + Cloud Firestore backend architecture is fully operational...',
    edited: false,
    deleted: false,
    pinned: false,
    reactions: [
      { emoji: '👍', userId: 'user-sarah', createdAt: Date.now() - 60000 },
    ],
    readByUserIds: ['user-alex', 'user-sarah'],
  },
  {
    messageId: 'msg-eng-1',
    conversationId: 'conv-engineering',
    workspaceId: 'ws-commonroom',
    senderId: 'user-elena',
    text: 'Checked all controller mappings. Every endpoint strictly validates token claims and rejects untrusted user IDs.',
    createdAt: Date.now() - 3600000 * 5,
    updatedAt: Date.now() - 3600000 * 5,
    replyToMessageId: null,
    edited: false,
    deleted: false,
    pinned: true,
    reactions: [
      { emoji: '🛡️', userId: 'user-alex', createdAt: Date.now() - 3600000 * 4 },
    ],
    readByUserIds: ['user-elena', 'user-alex'],
  },
  {
    messageId: 'msg-eng-2',
    conversationId: 'conv-engineering',
    workspaceId: 'ws-commonroom',
    senderId: 'user-elena',
    text: 'Java 17 records and JWT interceptors are working cleanly.',
    createdAt: Date.now() - 360000,
    updatedAt: Date.now() - 360000,
    replyToMessageId: null,
    edited: false,
    deleted: false,
    pinned: false,
    reactions: [],
    readByUserIds: ['user-elena', 'user-alex'],
  },
  {
    messageId: 'msg-dm-1',
    conversationId: 'conv-dm-sarah-alex',
    workspaceId: 'ws-commonroom',
    senderId: 'user-alex',
    text: 'Hey Sarah, how do the new channel and member views look on your screen?',
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 3600000,
    replyToMessageId: null,
    edited: false,
    deleted: false,
    pinned: false,
    reactions: [],
    readByUserIds: ['user-alex', 'user-sarah'],
  },
  {
    messageId: 'msg-dm-2',
    conversationId: 'conv-dm-sarah-alex',
    workspaceId: 'ws-commonroom',
    senderId: 'user-sarah',
    text: 'Love the new clean typography hierarchy. Feels fast and focused.',
    createdAt: Date.now() - 1800000,
    updatedAt: Date.now() - 1800000,
    replyToMessageId: null,
    edited: false,
    deleted: false,
    pinned: false,
    reactions: [
      { emoji: '❤️', userId: 'user-alex', createdAt: Date.now() - 1200000 },
    ],
    readByUserIds: ['user-alex', 'user-sarah'],
  },
];

const INITIAL_NOTIFICATIONS = [
  {
    notificationId: 'notif-1',
    recipientId: 'user-alex',
    senderId: 'user-sarah',
    senderName: 'Sarah Chen',
    type: 'REACTION',
    conversationId: 'conv-general',
    conversationName: 'general',
    messageId: 'msg-gen-3',
    content: 'Sarah Chen reacted with 👍 to your message',
    isRead: false,
    createdAt: Date.now() - 60000,
  },
  {
    notificationId: 'notif-2',
    recipientId: 'user-alex',
    senderId: 'user-marcus',
    senderName: 'Marcus Vance',
    type: 'GROUP_INVITE',
    conversationId: 'conv-general',
    conversationName: 'general',
    messageId: null,
    content: 'Marcus Vance confirmed your workspace administrator privileges',
    isRead: true,
    createdAt: Date.now() - 86400000,
  },
];

class LocalBackendEngine {
  constructor() {
    this.subscribers = new Set();
    this.initData();
  }

  initData() {
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      if (!existing) {
        this.state = {
          users: INITIAL_USERS,
          workspaces: INITIAL_WORKSPACES,
          workspaceMembers: INITIAL_MEMBERS,
          conversations: INITIAL_CONVERSATIONS,
          messages: INITIAL_MESSAGES,
          notifications: INITIAL_NOTIFICATIONS,
        };
        this.save();
      } else {
        this.state = JSON.parse(existing);
      }
    } catch {
      this.state = {
        users: INITIAL_USERS,
        workspaces: INITIAL_WORKSPACES,
        workspaceMembers: INITIAL_MEMBERS,
        conversations: INITIAL_CONVERSATIONS,
        messages: INITIAL_MESSAGES,
        notifications: INITIAL_NOTIFICATIONS,
      };
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Storage write error', e);
    }
    this.notify();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify() {
    for (const sub of this.subscribers) {
      try {
        sub();
      } catch (err) {
        console.error('Subscriber error', err);
      }
    }
  }

  // Auth Operations
  registerUser({ displayName, email, password, photoURL }) {
    const existing = this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (existing) {
      throw new Error('User with this email already exists');
    }
    const uid = 'user-' + Date.now();
    const newUser = {
      uid,
      displayName: displayName.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: 'hash_' + password,
      photoURL: photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`,
      status: 'ONLINE',
      statusMessage: 'Just joined CommonRoom',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastSeen: Date.now(),
    };
    this.state.users.push(newUser);

    // Auto-enroll into first workspace and general channel
    const defaultWs = this.state.workspaces[0];
    if (defaultWs) {
      this.state.workspaceMembers.push({
        id: `${defaultWs.workspaceId}_${uid}`,
        workspaceId: defaultWs.workspaceId,
        userId: uid,
        role: 'MEMBER',
        joinedAt: Date.now(),
      });
      const genConv = this.state.conversations.find(c => c.workspaceId === defaultWs.workspaceId && c.name === 'general');
      if (genConv && !genConv.participantIds.includes(uid)) {
        genConv.participantIds.push(uid);
      }
    }

    this.save();
    return { token: 'jwt-local-' + uid + '-' + Date.now(), user: newUser };
  }

  loginUser({ email, password }) {
    const user = this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      throw new Error('Invalid email or password');
    }
    // Update status
    user.status = 'ONLINE';
    user.lastSeen = Date.now();
    this.save();
    return { token: 'jwt-local-' + user.uid + '-' + Date.now(), user };
  }

  getUser(uid) {
    const user = this.state.users.find(u => u.uid === uid);
    if (!user) throw new Error('User not found');
    return user;
  }

  updateUser(uid, updates) {
    const user = this.getUser(uid);
    if (updates.displayName) user.displayName = updates.displayName.trim();
    if (updates.photoURL) user.photoURL = updates.photoURL;
    if (updates.status) user.status = updates.status;
    if (updates.statusMessage !== undefined) user.statusMessage = updates.statusMessage;
    user.updatedAt = Date.now();
    this.save();
    return user;
  }

  searchUsers(query = '') {
    const q = query.toLowerCase().trim();
    if (!q) return this.state.users;
    return this.state.users.filter(u =>
      (u.displayName && u.displayName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  }

  // Workspaces
  getUserWorkspaces(uid) {
    const memberWsIds = this.state.workspaceMembers
      .filter(m => m.userId === uid)
      .map(m => m.workspaceId);
    return this.state.workspaces.filter(ws => memberWsIds.includes(ws.workspaceId));
  }

  createWorkspace(uid, { name, description }) {
    const workspaceId = 'ws-' + Date.now();
    const ws = {
      workspaceId,
      name: name.trim(),
      description: description || '',
      ownerId: uid,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.state.workspaces.push(ws);
    this.state.workspaceMembers.push({
      id: `${workspaceId}_${uid}`,
      workspaceId,
      userId: uid,
      role: 'OWNER',
      joinedAt: Date.now(),
    });

    // Create default general channel
    const convId = 'conv-' + Date.now();
    const generalChannel = {
      conversationId: convId,
      workspaceId,
      type: 'GROUP',
      name: 'general',
      description: 'General discussions for ' + ws.name,
      createdBy: uid,
      participantIds: [uid],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastMessageAt: Date.now(),
      lastMessageText: 'Channel created',
      lastMessageSenderId: uid,
    };
    this.state.conversations.push(generalChannel);

    this.save();
    return ws;
  }

  getWorkspaceMembers(workspaceId) {
    const memberRecords = this.state.workspaceMembers.filter(m => m.workspaceId === workspaceId);
    const userIds = memberRecords.map(m => m.userId);
    return this.state.users.filter(u => userIds.includes(u.uid));
  }

  addWorkspaceMember(workspaceId, currentUserId, targetUserId, role = 'MEMBER') {
    const existing = this.state.workspaceMembers.find(
      m => m.workspaceId === workspaceId && m.userId === targetUserId
    );
    if (!existing) {
      const record = {
        id: `${workspaceId}_${targetUserId}`,
        workspaceId,
        userId: targetUserId,
        role,
        joinedAt: Date.now(),
      };
      this.state.workspaceMembers.push(record);

      // Add to general channel
      const genConv = this.state.conversations.find(c => c.workspaceId === workspaceId && c.name === 'general');
      if (genConv && !genConv.participantIds.includes(targetUserId)) {
        genConv.participantIds.push(targetUserId);
      }

      this.save();
      return record;
    }
    return existing;
  }

  // Conversations
  getWorkspaceConversations(workspaceId, uid) {
    return this.state.conversations.filter(
      c => c.workspaceId === workspaceId && c.participantIds.includes(uid)
    ).sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));
  }

  getConversation(convId) {
    const conv = this.state.conversations.find(c => c.conversationId === convId);
    if (!conv) throw new Error('Conversation not found');
    return conv;
  }

  createConversation(uid, { workspaceId, type, name, description, participantIds = [] }) {
    if (type === 'DIRECT') {
      const targetId = participantIds[0];
      const existing = this.state.conversations.find(
        c => c.workspaceId === workspaceId && c.type === 'DIRECT' &&
          c.participantIds.includes(uid) && c.participantIds.includes(targetId)
      );
      if (existing) return existing;

      const conv = {
        conversationId: 'conv-dm-' + Date.now(),
        workspaceId,
        type: 'DIRECT',
        name: null,
        description: null,
        createdBy: uid,
        participantIds: [uid, targetId],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastMessageAt: Date.now(),
        lastMessageText: null,
        lastMessageSenderId: null,
      };
      this.state.conversations.push(conv);
      this.save();
      return conv;
    } else {
      const conv = {
        conversationId: 'conv-' + Date.now(),
        workspaceId,
        type: 'GROUP',
        name: name.trim().toLowerCase().replaceAll(/\s+/g, '-'),
        description: description || '',
        createdBy: uid,
        participantIds: Array.from(new Set([uid, ...participantIds])),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastMessageAt: Date.now(),
        lastMessageText: 'Channel created',
        lastMessageSenderId: uid,
      };
      this.state.conversations.push(conv);

      // Notify invited
      const user = this.getUser(uid);
      participantIds.forEach(pId => {
        if (pId !== uid) {
          this.state.notifications.push({
            notificationId: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            recipientId: pId,
            senderId: uid,
            senderName: user.displayName,
            type: 'GROUP_INVITE',
            conversationId: conv.conversationId,
            conversationName: conv.name,
            content: `${user.displayName} added you to #${conv.name}`,
            isRead: false,
            createdAt: Date.now(),
          });
        }
      });

      this.save();
      return conv;
    }
  }

  updateConversation(convId, uid, updates) {
    const conv = this.getConversation(convId);
    if (conv.createdBy !== uid) {
      throw new Error('Only channel creator can update channel details');
    }
    if (updates.name) conv.name = updates.name.trim().toLowerCase().replaceAll(/\s+/g, '-');
    if (updates.description !== undefined) conv.description = updates.description;
    conv.updatedAt = Date.now();
    this.save();
    return conv;
  }

  addConversationMember(convId, uid, newUserId) {
    const conv = this.getConversation(convId);
    if (!conv.participantIds.includes(newUserId)) {
      conv.participantIds.push(newUserId);
      conv.updatedAt = Date.now();

      const user = this.getUser(uid);
      this.state.notifications.push({
        notificationId: 'notif-' + Date.now(),
        recipientId: newUserId,
        senderId: uid,
        senderName: user.displayName,
        type: 'GROUP_INVITE',
        conversationId: conv.conversationId,
        conversationName: conv.name,
        content: `${user.displayName} added you to #${conv.name}`,
        isRead: false,
        createdAt: Date.now(),
      });

      this.save();
    }
    return conv;
  }

  removeConversationMember(convId, currentUserId, targetUserId) {
    const conv = this.getConversation(convId);
    if (currentUserId !== targetUserId && conv.createdBy !== currentUserId) {
      throw new Error('Only channel creator can remove members');
    }
    conv.participantIds = conv.participantIds.filter(id => id !== targetUserId);
    conv.updatedAt = Date.now();
    this.save();
    return conv;
  }

  // Messages
  getMessages(conversationId) {
    return this.state.messages
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  sendMessage(conversationId, senderId, { text, replyToMessageId, replyToSenderName, replyToText }) {
    const conv = this.getConversation(conversationId);
    if (!conv.participantIds.includes(senderId)) {
      throw new Error('You are not a member of this conversation');
    }

    const messageId = 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const msg = {
      messageId,
      conversationId,
      workspaceId: conv.workspaceId,
      senderId,
      text: text.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      replyToMessageId: replyToMessageId || null,
      replyToSenderName: replyToSenderName || null,
      replyToText: replyToText || null,
      edited: false,
      deleted: false,
      pinned: false,
      reactions: [],
      readByUserIds: [senderId],
    };

    this.state.messages.push(msg);

    // Update conversation
    conv.lastMessageAt = msg.createdAt;
    conv.lastMessageText = msg.text;
    conv.lastMessageSenderId = senderId;
    conv.updatedAt = msg.createdAt;

    // Dispatch notifications to others
    const sender = this.getUser(senderId);
    conv.participantIds.forEach(pId => {
      if (pId !== senderId) {
        this.state.notifications.push({
          notificationId: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          recipientId: pId,
          senderId,
          senderName: sender.displayName,
          type: conv.type === 'DIRECT' ? 'DIRECT_MESSAGE' : 'CHANNEL_MENTION',
          conversationId,
          conversationName: conv.name,
          messageId,
          content: `${sender.displayName}: ${msg.text.length > 50 ? msg.text.substring(0, 50) + '...' : msg.text}`,
          isRead: false,
          createdAt: Date.now(),
        });
      }
    });

    this.save();
    return msg;
  }

  updateMessage(conversationId, messageId, senderId, newText) {
    const msg = this.state.messages.find(m => m.messageId === messageId);
    if (!msg) throw new Error('Message not found');
    if (msg.senderId !== senderId) throw new Error('Cannot edit another user message');
    if (msg.deleted) throw new Error('Cannot edit deleted message');

    msg.text = newText.trim();
    msg.edited = true;
    msg.updatedAt = Date.now();
    this.save();
    return msg;
  }

  deleteMessage(conversationId, messageId, senderId) {
    const msg = this.state.messages.find(m => m.messageId === messageId);
    if (!msg) throw new Error('Message not found');
    if (msg.senderId !== senderId) throw new Error('Cannot delete another user message');

    msg.deleted = true;
    msg.text = 'This message was deleted';
    msg.updatedAt = Date.now();
    this.save();
    return msg;
  }

  toggleReaction(conversationId, messageId, userId, emoji) {
    const msg = this.state.messages.find(m => m.messageId === messageId);
    if (!msg) throw new Error('Message not found');

    const index = msg.reactions.findIndex(r => r.emoji === emoji && r.userId === userId);
    if (index >= 0) {
      msg.reactions.splice(index, 1);
    } else {
      msg.reactions.push({ emoji, userId, createdAt: Date.now() });
    }
    this.save();
    return msg;
  }

  togglePin(conversationId, messageId) {
    const msg = this.state.messages.find(m => m.messageId === messageId);
    if (!msg) throw new Error('Message not found');
    msg.pinned = !msg.pinned;
    msg.updatedAt = Date.now();
    this.save();
    return msg;
  }

  // Notifications
  getUserNotifications(userId) {
    return this.state.notifications
      .filter(n => n.recipientId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  markNotificationRead(notificationId) {
    const notif = this.state.notifications.find(n => n.notificationId === notificationId);
    if (notif) {
      notif.isRead = true;
      this.save();
    }
  }

  markAllNotificationsRead(userId) {
    this.state.notifications
      .filter(n => n.recipientId === userId)
      .forEach(n => { n.isRead = true; });
    this.save();
  }

  resetToInitial() {
    localStorage.removeItem(STORAGE_KEY);
    this.initData();
    this.notify();
  }
}

export const localBackendEngine = new LocalBackendEngine();
